# Password Protection Setup

Your dashboard now has password protection! Users must enter a password before accessing the sales data.

## Default Password

By default, the password is: **`McGraw2025!`**

## How to Change the Password

You have two options to set a custom password:

### Option 1: Environment Variable in Vercel (Recommended - More Secure)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your McGraw Dashboard project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Key**: `REACT_APP_PASSWORD`
   - **Value**: `YourNewPassword123!` (use your own password)
   - **Environment**: Select "Production" (and "Preview" if you want)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on your latest deployment
8. Select **Redeploy**

Now your custom password will be used!

### Option 2: Hardcode in Source Code (Quick but Less Secure)

1. Open `/Users/jaysairbook/mcgraw-dashboard/frontend/src/Login.js`
2. Find this line (around line 8):
   ```javascript
   const correctPassword = process.env.REACT_APP_PASSWORD || 'McGraw2025!';
   ```
3. Change `'McGraw2025!'` to your desired password:
   ```javascript
   const correctPassword = process.env.REACT_APP_PASSWORD || 'YourNewPassword';
   ```
4. Save the file
5. Commit and push to GitHub:
   ```bash
   git add frontend/src/Login.js
   git commit -m "Update default password"
   git push
   ```
6. Vercel will automatically redeploy with the new password

## How Password Protection Works

- **Login Required**: When users visit your website, they see a login page first
- **Session Based**: Once logged in, users stay authenticated until they close their browser
- **No Database**: The password is checked on the client side (simple but effective for basic protection)
- **Browser Session**: Authentication is stored in `sessionStorage`, so it expires when the browser is closed

## Security Notes

**This is basic password protection suitable for:**
- Internal team dashboards
- Low-security data
- Keeping casual visitors out

**Not recommended for:**
- Highly sensitive data
- Financial information
- Personal identifiable information (PII)

**Why?**
- The password check happens in the browser (client-side)
- Tech-savvy users could potentially bypass it
- All users share the same password

## For More Secure Authentication

If you need stronger security, consider:
1. **Vercel Password Protection**: Built-in feature for Vercel Pro plans
2. **Auth0 or Clerk**: Professional authentication services
3. **Backend Authentication**: Move password check to API server

## Testing Your Password

1. Visit your website
2. You should see the login page with McGraw Motors logo
3. Enter the password
4. Click "Access Dashboard"
5. If correct, you'll see the sales dashboard
6. If incorrect, you'll see an error message

## Logging Out

Currently, users stay logged in until they:
- Close their browser/tab
- Clear browser storage
- Open the site in incognito/private mode

If you want to add a "Logout" button, let me know and I can add that feature!

---

Your dashboard is now password protected!
