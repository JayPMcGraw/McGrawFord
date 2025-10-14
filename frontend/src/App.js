import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [view, setView] = useState('overview');
  const [detailView, setDetailView] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchData = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();
      const randomBuster = Math.random().toString(36).substring(7);
      const [metricsRes, salesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics?t=${timestamp}&r=${randomBuster}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        // NEW API endpoint - completely different URL to bypass cache
        fetch(`${API_BASE_URL}/v2/sales?t=${timestamp}&r=${randomBuster}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      ]);
      setMetrics(await metricsRes.json());
      setSalesData(await salesRes.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  if (loading && !metrics) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      </div>
    );
  }

  const DetailTable = ({ data }) => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Salesperson</th>
            <th>Model</th>
            <th>Front End</th>
            <th>Back End</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sale, i) => (
            <tr key={i}>
              <td>{sale.date}</td>
              <td>{sale.salesperson}</td>
              <td>
                <div className="model-cell">
                  <span className={`badge badge-${sale.type.toLowerCase()}`}>{sale.type}</span>
                  <span className="model-name">{sale.model}</span>
                </div>
              </td>
              <td>{formatCurrency(sale.frontEnd)}</td>
              <td>{formatCurrency(sale.backEnd)}</td>
              <td className="total">{formatCurrency(sale.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (view === 'detail') {
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    // Get available months from sales data - filter to current year only
    const availableMonths = [...new Set(
      salesData
        .map(s => s.date?.slice(0, 7))
        .filter(m => m && m.startsWith(currentYear.toString()))
    )].sort().reverse();

    console.log('Available months:', availableMonths);
    console.log('Selected month:', selectedMonth);
    console.log('Sales data count:', salesData.length);

    const detailData = detailView === 'daily'
      ? salesData.filter(s => s.date && s.date.startsWith(today))
      : salesData.filter(s => s.date && s.date.startsWith(selectedMonth));

    // Calculate summary stats for selected month
    const monthData = salesData.filter(s => s.date && s.date.startsWith(selectedMonth));
    const newCount = monthData.filter(s => s.type === 'New').length;
    const usedCount = monthData.filter(s => s.type === 'Used').length;
    const totalRevenue = monthData.reduce((sum, s) => sum + s.total, 0);

    return (
      <div className="app">
        <div className="container">
          <div className="card header-card">
            <div className="card-header">
              <div className="header-logo-section">
                <img src="/mcgraw-logo.avif" alt="McGraw Motors" className="mcgraw-logo" />
                <p className="subtitle">Sales Detail</p>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button onClick={fetchData} className="btn-primary">Refresh</button>
                <button onClick={() => setView('overview')} className="btn-secondary">Back</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="button-group">
              <button
                onClick={() => setDetailView('daily')}
                className={detailView === 'daily' ? 'btn-primary' : 'btn-outline'}>
                Daily
              </button>
              <button
                onClick={() => setDetailView('monthly')}
                className={detailView === 'monthly' ? 'btn-primary' : 'btn-outline'}>
                Monthly
              </button>
            </div>

            {detailView === 'monthly' && (
              <div className="month-selector-container">
                <label htmlFor="month-select" className="month-selector-label">Select Month:</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="month-selector">
                  {availableMonths.map(month => {
                    // Parse YYYY-MM format manually to avoid timezone issues
                    const [year, monthNum] = month.split('-');
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                       'July', 'August', 'September', 'October', 'November', 'December'];
                    const monthName = monthNames[parseInt(monthNum) - 1];
                    return (
                      <option key={month} value={month}>
                        {monthName} {year}
                      </option>
                    );
                  })}
                </select>
                <div className="month-summary">
                  <span className="summary-item">Total Sales: <strong>{monthData.length}</strong></span>
                  <span className="summary-item">New: <strong>{newCount}</strong></span>
                  <span className="summary-item">Used: <strong>{usedCount}</strong></span>
                  <span className="summary-item">Revenue: <strong>{formatCurrency(totalRevenue)}</strong></span>
                </div>
              </div>
            )}

            <DetailTable data={detailData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="card header-card">
          <div className="card-header">
            <div className="header-logo-section">
              <img src="/mcgraw-logo.avif" alt="McGraw Motors" className="mcgraw-logo" />
              <p className="subtitle">Sales Performance Dashboard</p>
            </div>
            <button onClick={fetchData} className="btn-primary">Refresh</button>
          </div>
        </div>

        <div className="card">
          <h2>Today's Performance</h2>
          <div className="metrics-grid">
            <div className="metric blue">
              <p className="metric-label">New Cars Sold</p>
              <p className="metric-value">{metrics?.daily?.newSales || 0}</p>
            </div>
            <div className="metric green">
              <p className="metric-label">Used Cars Sold</p>
              <p className="metric-value">{metrics?.daily?.usedSales || 0}</p>
            </div>
            <div className="metric purple">
              <p className="metric-label">Total Sales</p>
              <p className="metric-value">{metrics?.daily?.totalSales || 0}</p>
            </div>
            <div className="metric orange">
              <p className="metric-label">Daily Revenue</p>
              <p className="metric-value-sm">{formatCurrency(metrics?.daily?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Monthly Performance</h2>
          <div className="metrics-grid-3">
            <div className="metric blue">
              <p className="metric-label">New Cars Sold</p>
              <p className="metric-value">{metrics?.monthly?.newSales || 0}</p>
            </div>
            <div className="metric green">
              <p className="metric-label">Used Cars Sold</p>
              <p className="metric-value">{metrics?.monthly?.usedSales || 0}</p>
            </div>
            <div className="metric orange">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value-sm">{formatCurrency(metrics?.monthly?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Averages Per Unit</h2>
          <div className="metrics-grid-2">
            <div className="metric indigo">
              <p className="metric-label">Average Front End</p>
              <p className="metric-value">{formatCurrency(metrics?.averages?.frontEnd || 0)}</p>
            </div>
            <div className="metric pink">
              <p className="metric-label">Average Back End</p>
              <p className="metric-value">{formatCurrency(metrics?.averages?.backEnd || 0)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="button-group-full">
            <button onClick={() => setView('detail')} className="btn-primary">
              View Daily Detail
            </button>
            <button onClick={() => { setDetailView('monthly'); setView('detail'); }} className="btn-success">
              View Monthly Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
