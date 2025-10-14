# Deploying McGraw Motors Dashboard to Vercel

This guide will walk you through deploying your dashboard to Vercel, making it accessible as a public website.

## Prerequisites

- Vercel account (free tier is sufficient)
- GitHub repository with your code (✅ Already done: https://github.com/JayPMcGraw/McGrawFord.git)

## Step-by-Step Deployment Instructions

### 1. Log into Vercel

Go to https://vercel.com and log in with your account.

### 2. Import Your GitHub Repository

1. Click the **"Add New..."** button in the Vercel dashboard
2. Select **"Project"**
3. Click **"Import Git Repository"**
4. If you haven't connected GitHub yet:
   - Click **"Connect GitHub Account"**
   - Authorize Vercel to access your GitHub repositories
5. Find your repository: **JayPMcGraw/McGrawFord**
6. Click **"Import"**

### 3. Configure Your Project

On the configuration screen:

1. **Project Name**: You can keep the default or change it (e.g., `mcgraw-dashboard`)

2. **Framework Preset**: Vercel should auto-detect "Create React App" - leave it as is

3. **Root Directory**: Leave as `.` (root)

4. **Build and Output Settings**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `npm install`

5. **Environment Variables**: None needed (your Google Sheets are public)

### 4. Deploy!

Click the **"Deploy"** button and wait 2-3 minutes for the build to complete.

Vercel will:
- Install all dependencies
- Build your React frontend
- Deploy your serverless API functions
- Provide you with a live URL

### 5. Access Your Live Website

Once deployment is complete, Vercel will show you:
- **Production URL**: Something like `https://mcgraw-dashboard.vercel.app`
- Click the URL to view your live dashboard!

### 6. Custom Domain (Optional)

If you want a custom domain like `dashboard.mcgrawmotors.com`:

1. Go to your project settings in Vercel
2. Click **"Domains"** tab
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS records

## Automatic Updates

Great news! Vercel is now connected to your GitHub repository. Every time you push changes to GitHub:
- Vercel automatically detects the changes
- Builds and deploys the new version
- Updates your live website (usually takes 2-3 minutes)

## Vercel Project Structure

Your project is configured with:

```
mcgraw-dashboard/
├── api/                    # Serverless backend functions
│   ├── index.js           # Main API handler (replaces backend/server.js)
│   └── package.json       # API dependencies
├── frontend/              # React application
│   └── build/            # Built files (auto-generated)
├── vercel.json           # Vercel configuration
```

## How It Works

1. **Frontend**: React app is built and served as static files
2. **Backend**: The `api/index.js` file runs as a serverless function
3. **API Routes**: All `/api/*` requests are routed to the serverless function
4. **Data**: Google Sheets are fetched directly from the serverless function

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard. Common issues:
- Missing dependencies: Make sure both `frontend/package.json` and `api/package.json` are committed
- Build errors: Test locally with `cd frontend && npm run build`

### API Not Working

- Check the Functions tab in Vercel dashboard for error logs
- Verify Google Sheets are still publicly accessible
- Test the API endpoint: `https://your-url.vercel.app/api/health`

### Data Not Updating

- The cache is set to 5 minutes (300,000ms)
- Click the "Refresh Data" button to force an update
- Check Google Sheets IDs are correct in `api/index.js`

## Next Steps

After deployment:

1. **Test Your Website**: Visit the Vercel URL and verify all features work
2. **Share the URL**: Send the link to anyone who needs access (no login required)
3. **Monitor Usage**: Check Vercel dashboard for traffic and function execution stats
4. **Update Anytime**: Just push to GitHub - Vercel handles the rest!

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: Available in your dashboard

---

Your dashboard is now live and accessible from anywhere! 🎉
