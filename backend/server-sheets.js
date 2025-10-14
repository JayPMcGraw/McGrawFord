const express = require('express');
const cors = require('cors');
const https = require('https');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

let cache = { data: null, timestamp: null, ttl: 300000 };

// Google Sheets IDs
const NEW_CAR_SHEET_ID = '1bQK2fAjWCF1PnmAw2yV-DbKQg_ef52lB';
const USED_CAR_SHEET_ID = '1t1aXUA5_OjEgTn0uUfVOkWrg_0kH6wuW';

function fetchGoogleSheet(sheetId) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;

    https.get(url, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function parseSheetData(rows, type) {
  if (!rows || rows.length === 0) return [];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const date = row[0] ? String(row[0]) : '';
    const salesperson = row[1] ? String(row[1]) : '';
    const model = row[2] ? String(row[2]) : '';
    const frontEnd = parseFloat(row[3]) || 0;
    const backEnd = parseFloat(row[4]) || 0;
    const total = parseFloat(row[5]) || (frontEnd + backEnd);

    data.push({
      date,
      salesperson,
      model,
      frontEnd,
      backEnd,
      total,
      type
    });
  }

  return data;
}

async function getAllSalesData(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cache.data && cache.timestamp && (now - cache.timestamp < cache.ttl)) {
    return cache.data;
  }

  try {
    console.log('Fetching data from Google Sheets...');
    const [newCarRows, usedCarRows] = await Promise.all([
      fetchGoogleSheet(NEW_CAR_SHEET_ID),
      fetchGoogleSheet(USED_CAR_SHEET_ID)
    ]);

    const allSales = [
      ...parseSheetData(newCarRows, 'New'),
      ...parseSheetData(usedCarRows, 'Used')
    ];

    cache.data = allSales;
    cache.timestamp = now;

    console.log(`✅ Loaded ${allSales.length} total sales records from Google Sheets`);
    return allSales;
  } catch (error) {
    console.error('Error fetching sales data from Google Sheets:', error);
    if (cache.data) {
      console.log('Using cached data');
      return cache.data;
    }
    return [];
  }
}

function calculateMetrics(sales) {
  if (!sales || sales.length === 0) {
    return {
      daily: { newSales: 0, usedSales: 0, totalSales: 0, newRevenue: 0, usedRevenue: 0, totalRevenue: 0 },
      monthly: { newSales: 0, usedSales: 0, totalSales: 0, newRevenue: 0, usedRevenue: 0, totalRevenue: 0 },
      averages: { frontEnd: 0, backEnd: 0, total: 0 }
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const todaySales = sales.filter(s => s.date.startsWith(today));
  const monthSales = sales.filter(s => s.date.startsWith(currentMonth));

  const todayNew = todaySales.filter(s => s.type === 'New');
  const todayUsed = todaySales.filter(s => s.type === 'Used');
  const monthNew = monthSales.filter(s => s.type === 'New');
  const monthUsed = monthSales.filter(s => s.type === 'Used');

  return {
    daily: {
      newSales: todayNew.length,
      usedSales: todayUsed.length,
      totalSales: todaySales.length,
      newRevenue: todayNew.reduce((sum, s) => sum + s.total, 0),
      usedRevenue: todayUsed.reduce((sum, s) => sum + s.total, 0),
      totalRevenue: todaySales.reduce((sum, s) => sum + s.total, 0)
    },
    monthly: {
      newSales: monthNew.length,
      usedSales: monthUsed.length,
      totalSales: monthSales.length,
      newRevenue: monthNew.reduce((sum, s) => sum + s.total, 0),
      usedRevenue: monthUsed.reduce((sum, s) => sum + s.total, 0),
      totalRevenue: monthSales.reduce((sum, s) => sum + s.total, 0)
    },
    averages: {
      frontEnd: sales.length > 0 ? sales.reduce((sum, s) => sum + s.frontEnd, 0) / sales.length : 0,
      backEnd: sales.length > 0 ? sales.reduce((sum, s) => sum + s.backEnd, 0) / sales.length : 0,
      total: sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0
    }
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/metrics', async (req, res) => {
  try {
    const sales = await getAllSalesData();
    res.json(calculateMetrics(sales));
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/api/sales/all', async (req, res) => {
  try {
    res.json(await getAllSalesData());
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Backend server running with Google Sheets integration!`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log(`📊 Connected to:`);
  console.log(`   - New Car Sheet: ${NEW_CAR_SHEET_ID}`);
  console.log(`   - Used Car Sheet: ${USED_CAR_SHEET_ID}\n`);
});

module.exports = app;
