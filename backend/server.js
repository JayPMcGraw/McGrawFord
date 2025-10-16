const express = require('express');
const cors = require('cors');
const https = require('https');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// AGGRESSIVE cache prevention - force browsers to never cache API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

let cache = { data: null, timestamp: null, ttl: 300000 };

// Google Sheets IDs
const NEW_CAR_SHEET_ID = '1bQK2fAjWCF1PnmAw2yV-DbKQg_ef52lB';
const USED_CAR_SHEET_ID = '1t1aXUA5_OjEgTn0uUfVOkWrg_0kH6wuW';

function fetchGoogleSheet(sheetId) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, (redirectResponse) => {
          const chunks = [];

          redirectResponse.on('data', (chunk) => {
            chunks.push(chunk);
          });

          redirectResponse.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              const workbook = XLSX.read(buffer, { type: 'buffer', sheetRows: 200 });

              // Read ALL sheets/tabs and combine data
              const allData = [];
              workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
                allData.push({ sheetName, data: sheetData });
              });

              resolve(allData);
            } catch (error) {
              reject(error);
            }
          });
        }).on('error', reject);
      } else {
        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            const workbook = XLSX.read(buffer, { type: 'buffer', sheetRows: 200 });

            // Read ALL sheets/tabs and combine data
            const allData = [];
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
              allData.push({ sheetName, data: sheetData });
            });

            resolve(allData);
          } catch (error) {
            reject(error);
          }
        });
      }
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function excelDateToJSDate(excelDate) {
  // Excel dates are days since 1900-01-01 (with leap year bug)
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
  const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
  return jsDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

function parseSheetData(rows, type, sheetName) {
  if (!rows || rows.length === 0) return [];
  const data = [];
  let consecutiveEmptyRows = 0;
  const MAX_EMPTY_ROWS = 10; // Stop after 10 consecutive empty rows

  // Start from row 2 (skip header rows)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];

    // Check if row is completely empty or doesn't have required fields
    const hasDate = row && row[1];
    const hasSalesperson = row && row[14];

    if (!hasDate && !hasSalesperson) {
      consecutiveEmptyRows++;
      if (consecutiveEmptyRows >= MAX_EMPTY_ROWS) {
        console.log(`Stopping at row ${i} after ${MAX_EMPTY_ROWS} consecutive empty rows in ${sheetName}`);
        break;
      }
      continue;
    }

    // Reset counter if we find data
    if (hasDate || hasSalesperson) {
      consecutiveEmptyRows = 0;
    }

    // Skip if missing required fields
    if (!hasDate || !hasSalesperson) continue;

    // Parse date - handle both Excel serial dates and text dates
    let date = '';
    const rawDate = row[1];
    if (typeof rawDate === 'number') {
      date = excelDateToJSDate(rawDate);
    } else {
      // Handle text dates including malformed formats like "1015/25" or "10/15/25"
      const dateStr = String(rawDate);

      // Check for malformed date patterns like "1015/25" (MMDD/YY)
      if (/^\d{3,4}\/\d{2}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        const mmdd = parts[0].padStart(4, '0'); // Ensure 4 digits
        const mm = mmdd.substring(0, 2);
        const dd = mmdd.substring(2, 4);
        const yy = parts[1];
        date = `20${yy}-${mm}-${dd}`;
      } else {
        date = dateStr;
      }
    }

    const salesperson = String(row[14]);
    const model = row[6] ? String(row[6]) : '';  // Column G (index 6)
    const frontEnd = parseFloat(row[9]) || 0;  // Column J (index 9)
    const backEnd = parseFloat(row[10]) || 0;  // Column K (index 10)
    const total = parseFloat(row[11]) || (frontEnd + backEnd);  // Column L (index 11)

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

  console.log(`Parsed ${data.length} records from ${sheetName} (${type})`);
  return data;
}

async function getAllSalesData(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cache.data && cache.timestamp && (now - cache.timestamp < cache.ttl)) {
    return cache.data;
  }

  try {
    console.log('Fetching data from Google Sheets...');
    const [newCarSheets, usedCarSheets] = await Promise.all([
      fetchGoogleSheet(NEW_CAR_SHEET_ID),
      fetchGoogleSheet(USED_CAR_SHEET_ID)
    ]);

    const allSales = [];

    // Process all tabs from new car sheet
    newCarSheets.forEach(({ sheetName, data }) => {
      console.log(`Processing New Car sheet: ${sheetName}`);
      allSales.push(...parseSheetData(data, 'New', sheetName));
    });

    // Process all tabs from used car sheet
    usedCarSheets.forEach(({ sheetName, data }) => {
      console.log(`Processing Used Car sheet: ${sheetName}`);
      allSales.push(...parseSheetData(data, 'Used', sheetName));
    });

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

  // Use Central Time (US/Central) for "today"
  const now = new Date();
  const centralDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }); // YYYY-MM-DD format
  const today = centralDateStr;
  const currentMonth = today.slice(0, 7);

  const todaySales = sales.filter(s => s.date.startsWith(today));
  let monthSales = sales.filter(s => s.date.startsWith(currentMonth));

  // If no sales this month, use the month with the most sales
  if (monthSales.length === 0 && sales.length > 0) {
    const monthCounts = {};
    sales.forEach(s => {
      if (s.date) {
        const month = s.date.slice(0, 7);
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    const mostActiveMonth = Object.keys(monthCounts).sort((a, b) => monthCounts[b] - monthCounts[a])[0];
    monthSales = sales.filter(s => s.date.startsWith(mostActiveMonth));
  }

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

// NEW endpoint with different URL to bypass any cache
app.get('/api/v2/sales', async (req, res) => {
  try {
    res.json(await getAllSalesData(true)); // Force refresh
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// Debug endpoint to see ALL dates in detail
app.get('/api/debug/dates', async (req, res) => {
  try {
    const sales = await getAllSalesData(true);
    const monthGroups = {};
    sales.forEach(sale => {
      const month = sale.date.slice(0, 7);
      if (!monthGroups[month]) {
        monthGroups[month] = [];
      }
      monthGroups[month].push(sale.date);
    });

    const summary = Object.keys(monthGroups).sort().map(month => ({
      month,
      count: monthGroups[month].length,
      sampleDates: monthGroups[month].slice(0, 5)
    }));

    res.json({
      totalSales: sales.length,
      months: summary,
      allMonths: Object.keys(monthGroups).sort()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve test page for verifying backend data
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test-months.html');
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
