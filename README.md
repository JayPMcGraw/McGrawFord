# McGraw Motors Sales Dashboard

A real-time sales performance dashboard for McGraw Motors, featuring live data integration from Google Sheets and comprehensive sales analytics.

## Features

- **Real-time Data Sync**: Automatically syncs with Google Sheets every 5 minutes
- **Daily Performance Metrics**: Track today's new and used car sales with revenue totals
- **Monthly Analytics**: View current month performance with automatic rollover
- **Detailed Sales Views**:
  - Daily detail view for today's individual sales
  - Monthly detail view with month selector dropdown
- **Multi-tab Support**: Automatically reads all tabs (months) from Google Sheets
- **Responsive Design**: Clean, modern interface optimized for desktop displays
- **Cache-Optimized**: Aggressive cache prevention for always-fresh data

## Technology Stack

### Backend
- **Node.js** with Express
- **XLSX** library for Excel file parsing
- Google Sheets public export integration
- RESTful API endpoints with CORS support

### Frontend
- **React** 18
- Modern CSS with Flexbox/Grid layouts
- Real-time data updates
- Timezone-aware date handling

## Project Structure

```
mcgraw-dashboard/
├── backend/
│   ├── server.js           # Express server with Google Sheets integration
│   ├── package.json        # Backend dependencies
│   └── test-months.html    # Debug test page (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   ├── public/
│   │   ├── mcgraw-logo.avif  # McGraw Motors logo
│   │   └── index.html     # HTML template
│   └── package.json       # Frontend dependencies
├── start.sh               # Convenience script to start both servers
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Google Sheets with public sharing enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mcgraw-dashboard
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure Google Sheets** (Important!)

   Update the Google Sheets IDs in `backend/server.js`:
   ```javascript
   const NEW_CAR_SHEET_ID = 'YOUR_NEW_CAR_SHEET_ID';
   const USED_CAR_SHEET_ID = 'YOUR_USED_CAR_SHEET_ID';
   ```

   To get the Sheet ID from your Google Sheets URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

### Running the Application

**Option 1: Use the start script (recommended)**
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Start servers manually**

Terminal 1 - Backend:
```bash
cd backend
node server.js
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Google Sheets Setup

### Required Sheet Structure

Your Google Sheets should have the following structure:

#### Tabs
- AUGUST
- SEPTEMBER
- OCTOBER
- NOVEMBER
- DECEMBER

(The backend automatically reads all tabs)

#### Column Mapping
- **Column B (index 1)**: Date (Excel serial number or text date)
- **Column G (index 6)**: Vehicle Model
- **Column J (index 9)**: Front End Amount
- **Column K (index 10)**: Back End Amount
- **Column L (index 11)**: Total Amount
- **Column O (index 14)**: Salesperson Name

### Making Sheets Public
1. Open your Google Sheet
2. Click "Share" → "Change to anyone with the link"
3. Set permission to "Viewer"
4. Copy the Sheet ID from the URL

## API Endpoints

### GET /api/health
Health check endpoint
```json
{ "status": "ok", "timestamp": "2025-10-13T..." }
```

### GET /api/metrics
Current performance metrics
```json
{
  "daily": {
    "newSales": 5,
    "usedSales": 3,
    "totalSales": 8,
    "totalRevenue": 125000
  },
  "monthly": { ... },
  "averages": {
    "frontEnd": 3500,
    "backEnd": 2000,
    "total": 5500
  }
}
```

### GET /api/v2/sales
All sales records (with cache busting)
```json
[
  {
    "date": "2025-10-13",
    "salesperson": "John Doe",
    "model": "2025 F-150",
    "frontEnd": 3500,
    "backEnd": 2000,
    "total": 5500,
    "type": "New"
  }
]
```

### GET /api/debug/dates
Debug endpoint showing all available months
```json
{
  "totalSales": 127,
  "months": [
    {
      "month": "2025-10",
      "count": 20,
      "sampleDates": ["2025-10-04", "2025-10-06", ...]
    }
  ],
  "allMonths": ["2025-08", "2025-09", "2025-10"]
}
```

## Features in Detail

### Automatic Month Detection
- Dynamically extracts unique months from sales data
- Filters to current year only
- Automatically adds new months as data is entered in Google Sheets
- No code changes needed when adding new months

### Timezone Handling
- Properly handles Excel serial date conversion
- Avoids timezone offset bugs in date display
- Shows correct month names regardless of user timezone

### Cache Prevention
- Aggressive cache-control headers on backend
- Client-side cache busting with random parameters
- Fresh data on every request

### Data Refresh
- Auto-refresh every 5 minutes
- Manual refresh button available
- Force refresh clears backend cache

## Customization

### Changing Colors
Edit `frontend/src/App.css`:
```css
.metric.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.metric.green { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
/* Add more color schemes */
```

### Modifying Column Mapping
Update `backend/server.js` in the `parseSheetData` function:
```javascript
const salesperson = row[14]; // Column O
const model = row[6];        // Column G
// Adjust indices as needed
```

### Adding New Metrics
1. Update `calculateMetrics()` in `backend/server.js`
2. Add new UI components in `frontend/src/App.js`
3. Style in `frontend/src/App.css`

## Troubleshooting

### "Connection Error" on Frontend
- Verify backend is running on port 3001
- Check CORS settings in `backend/server.js`
- Ensure Google Sheets are publicly accessible

### Data Not Updating
- Click "Refresh Data" button
- Check browser console for errors
- Verify Google Sheets IDs are correct
- Test backend directly: `curl http://localhost:3001/api/v2/sales`

### Wrong Months Showing
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Try incognito/private browsing mode
- Check `/api/debug/dates` endpoint for actual data

### Excel Dates Not Converting
- Ensure dates in Google Sheets are in Excel serial number format
- Check `excelDateToJSDate()` function in `backend/server.js`

## Contributing

When contributing, please:
1. Follow the existing code style
2. Test both frontend and backend thoroughly
3. Update documentation for any new features
4. Ensure all data displays correctly in multiple timezones

## License

Private - McGraw Motors Internal Use

## Support

For issues or questions, contact the development team.
