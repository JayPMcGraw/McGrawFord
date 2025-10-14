# Connecting Your GoDaddy Domain to Vercel

This guide walks you through connecting your GoDaddy domain to your Vercel-hosted dashboard.

## Step 1: Add Domain in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your **McGraw Dashboard** project
3. Click the **"Settings"** tab at the top
4. Click **"Domains"** in the left sidebar
5. In the "Add Domain" field, enter your domain:
   - For root domain: `yourdomain.com`
   - For subdomain: `dashboard.yourdomain.com` (recommended)
6. Click **"Add"**

Vercel will now show you DNS configuration instructions.

## Step 2: Configure DNS in GoDaddy

### Option A: Using a Subdomain (Recommended - e.g., dashboard.yourdomain.com)

1. Log into your GoDaddy account: https://www.godaddy.com
2. Go to **"My Products"**
3. Find your domain and click **"DNS"**
4. Click **"Add"** to add a new record
5. Configure the CNAME record:
   - **Type**: CNAME
   - **Name**: `dashboard` (or whatever subdomain you chose)
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: 600 seconds (default)
6. Click **"Save"**

### Option B: Using Root Domain (e.g., yourdomain.com)

1. Log into your GoDaddy account
2. Go to **"My Products"** → Click **"DNS"** for your domain
3. You need to add an A record. Vercel will provide you with an IP address
4. Add/Edit the A record:
   - **Type**: A
   - **Name**: `@` (this represents the root domain)
   - **Value**: The IP address provided by Vercel (usually `76.76.21.21`)
   - **TTL**: 600 seconds
5. Also add a CNAME for www:
   - **Type**: CNAME
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: 600 seconds
6. Click **"Save"**

## Step 3: Verify Domain in Vercel

1. Go back to Vercel → Your Project → Settings → Domains
2. You should see your domain with a status indicator
3. DNS propagation can take 5 minutes to 48 hours (usually 10-30 minutes)
4. Once verified, Vercel will automatically provision an SSL certificate (HTTPS)
5. Your domain status will change to **"Valid"** with a green checkmark

## Step 4: Test Your Domain

Once DNS propagates:
- Visit your domain in a browser (e.g., `https://dashboard.yourdomain.com`)
- You should see your McGraw Motors Dashboard
- The connection should be secure (HTTPS with padlock icon)

## Troubleshooting

### Domain not working after 30 minutes?

1. **Check DNS propagation**: Use https://dnschecker.org to see if your DNS changes have propagated globally
2. **Verify CNAME/A record**: Make sure the record points to `cname.vercel-dns.com` or the correct IP
3. **Clear browser cache**: Try in incognito mode or a different browser
4. **Check Vercel logs**: Go to your project → Deployments tab for any errors

### SSL Certificate Issues?

- Vercel automatically provisions SSL certificates (this can take 5-10 minutes)
- If it fails, try removing and re-adding the domain in Vercel
- Make sure your DNS records are correct

### Still Having Issues?

Contact Vercel support through your dashboard - they're very responsive and can help diagnose DNS issues.

## What Domain Should You Use?

**Recommended options:**
- `dashboard.yourdomain.com` (subdomain - easiest to set up)
- `sales.yourdomain.com` (subdomain)
- `yourdomain.com` (root domain - if you're not using it for anything else)

---

Once your domain is connected, you can access your dashboard at your custom domain with HTTPS!
