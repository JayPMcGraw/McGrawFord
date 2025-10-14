# Setting Up www.mcgrawforddashboard.com

Complete guide to connect your GoDaddy domain **www.mcgrawforddashboard.com** to your Vercel dashboard.

## Step 1: Add Domain in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **McGraw Dashboard** project
3. Click **"Settings"** → **"Domains"**
4. Click **"Add"** button
5. Enter: `www.mcgrawforddashboard.com`
6. Click **"Add"**

Vercel will show you the DNS records you need to configure.

## Step 2: Configure DNS in GoDaddy

### Log into GoDaddy

1. Go to https://www.godaddy.com
2. Sign in to your account
3. Go to **"My Products"**
4. Find **mcgrawforddashboard.com** and click **"DNS"**

### Add CNAME Record for www

1. Scroll to the **DNS Records** section
2. Click **"Add"** (or "Add Record")
3. Configure the CNAME record:
   - **Type**: Select `CNAME`
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `600 seconds` (default - 10 minutes)
4. Click **"Save"**

### Optional: Redirect Root Domain

If you also want `mcgrawforddashboard.com` (without www) to work:

1. In Vercel, also add `mcgrawforddashboard.com` (without www)
2. In GoDaddy, add an A record:
   - **Type**: `A`
   - **Name**: `@`
   - **Value**: `76.76.21.21` (Vercel's IP)
   - **TTL**: `600 seconds`
3. Click **"Save"**

## Step 3: Wait for DNS Propagation

- **Minimum wait**: 10-30 minutes
- **Maximum wait**: Up to 48 hours (rarely)
- **Usually ready**: Within 15-20 minutes

### Check DNS Propagation

Visit https://dnschecker.org and enter `www.mcgrawforddashboard.com` to see if DNS has propagated globally.

## Step 4: Verify in Vercel

1. Go back to Vercel → Your Project → Settings → Domains
2. You should see `www.mcgrawforddashboard.com`
3. Status will change from "Pending" to "Valid" with a green checkmark
4. Vercel will automatically provision an SSL certificate (HTTPS)

## Step 5: Test Your Domain

Once DNS propagates:

1. Visit `https://www.mcgrawforddashboard.com`
2. You should see your McGraw Motors login page
3. Enter password: **`alwaysbeclosing`**
4. You'll be redirected to your sales dashboard

## Current Password

Your dashboard password is now set to: **`alwaysbeclosing`**

## Troubleshooting

### Domain not working after 30 minutes?

1. **Check DNS in GoDaddy**: Verify the CNAME record is correctly set to `cname.vercel-dns.com`
2. **Check Vercel status**: Go to Settings → Domains and look for any error messages
3. **Clear browser cache**: Try in incognito/private browsing mode
4. **Use DNS checker**: https://dnschecker.org to verify propagation

### "Invalid Configuration" in Vercel?

- Make sure you added `www.mcgrawforddashboard.com` (not just `mcgrawforddashboard.com`)
- Verify the CNAME record in GoDaddy points to `cname.vercel-dns.com`

### SSL Certificate Not Working?

- Vercel provisions SSL automatically (takes 5-10 minutes after DNS is valid)
- If it fails, try removing and re-adding the domain in Vercel

## Summary

**Your Setup:**
- Domain: www.mcgrawforddashboard.com
- Password: alwaysbeclosing
- DNS: CNAME record pointing to cname.vercel-dns.com
- SSL: Automatic via Vercel

Once DNS propagates, your dashboard will be live at your custom domain!
