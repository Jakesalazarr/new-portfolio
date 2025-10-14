# Cloudflare Pages Deployment Guide

This guide will help you deploy your portfolio to Cloudflare Pages with custom domain from Namecheap.

## Prerequisites

- GitHub account
- Cloudflare account (free tier)
- Namecheap domain

## Step 1: Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial portfolio setup"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/portfolio.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Main Portfolio to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub account
4. Select your portfolio repository
5. Configure build settings:
   - **Project name**: `portfolio`
   - **Production branch**: `main`
   - **Build command**: Leave empty (static HTML)
   - **Build output directory**: `/`
6. Click **Save and Deploy**

Your main portfolio will be live at: `portfolio.pages.dev`

## Step 3: Deploy Individual Projects

### Deploy Angular App (Kura)

1. Create a new Cloudflare Pages project
2. Select the same repository
3. Configure:
   - **Project name**: `kura-furniture`
   - **Build command**: `cd 01-kura-angular && npm install && npm run build`
   - **Build output directory**: `01-kura-angular/dist/kura`
4. Deploy

### Deploy React App (Vogue)

1. Create a new Cloudflare Pages project
2. Configure:
   - **Project name**: `vogue-clothing`
   - **Build command**: `cd 02-vogue-react && npm install && npm run build`
   - **Build output directory**: `02-vogue-react/dist`
4. Deploy

### Deploy Python Chat App

1. Create a new Cloudflare Pages project
2. Configure:
   - **Project name**: `chatai`
   - **Build command**: `cd 03-chatai-python && npm install && npm run build`
   - **Build output directory**: `03-chatai-python/dist`
3. Deploy

### Deploy Analytics Dashboard

1. Create a new Cloudflare Pages project
2. Configure:
   - **Project name**: `analytics-dashboard`
   - **Build command**: `cd 04-analytics-dashboard && npm install && npm run build`
   - **Build output directory**: `04-analytics-dashboard/dist`
3. Deploy

## Step 4: Configure Custom Domain (Namecheap)

### Add Domain to Cloudflare

1. In Cloudflare Dashboard, go to **Websites** → **Add a site**
2. Enter your domain: `yourdomain.com`
3. Select Free plan
4. Cloudflare will scan your DNS records
5. Click **Continue**

### Update Nameservers in Namecheap

1. Log into Namecheap
2. Go to **Domain List** → Select your domain
3. Navigate to **Nameservers** section
4. Select **Custom DNS**
5. Add Cloudflare nameservers (shown in Cloudflare dashboard):
   ```
   nameserver1.cloudflare.com
   nameserver2.cloudflare.com
   ```
6. Save changes (propagation takes 24-48 hours, usually faster)

### Configure DNS Records in Cloudflare

1. Go to **DNS** → **Records**
2. Add the following records:

#### Main Portfolio
```
Type: CNAME
Name: @
Content: portfolio.pages.dev
Proxy status: Proxied
```

#### Subdomains for Projects
```
Type: CNAME
Name: kura
Content: kura-furniture.pages.dev
Proxy status: Proxied

Type: CNAME
Name: vogue
Content: vogue-clothing.pages.dev
Proxy status: Proxied

Type: CNAME
Name: chat
Content: chatai.pages.dev
Proxy status: Proxied

Type: CNAME
Name: dashboard
Content: analytics-dashboard.pages.dev
Proxy status: Proxied
```

### Link Custom Domains in Cloudflare Pages

For each project:

1. Go to **Pages** → Select project
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter domain:
   - Main portfolio: `yourdomain.com`
   - Kura: `kura.yourdomain.com`
   - Vogue: `vogue.yourdomain.com`
   - ChatAI: `chat.yourdomain.com`
   - Dashboard: `dashboard.yourdomain.com`
5. Click **Continue** → Cloudflare will automatically configure SSL

## Step 5: Enable Security Features

### Enable HTTPS/SSL

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
3. Go to **Edge Certificates**
4. Enable:
   - Always Use HTTPS
   - Automatic HTTPS Rewrites
   - Minimum TLS Version: 1.2

### Enable Performance Features

1. Go to **Speed** → **Optimization**
2. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - Early Hints
   - HTTP/2 to Origin

## Step 6: Configure Redirects (Optional)

Create a `_redirects` file in the root:

```
# Redirect www to non-www
https://www.yourdomain.com/* https://yourdomain.com/:splat 301!

# SPA fallback for Angular/React apps
/01-kura-angular/* /01-kura-angular/index.html 200
/02-vogue-react/* /02-vogue-react/index.html 200
/03-chatai-python/* /03-chatai-python/index.html 200
/04-analytics-dashboard/* /04-analytics-dashboard/index.html 200
```

## Final URLs

After setup, your portfolio will be accessible at:

- **Main Portfolio**: `https://yourdomain.com`
- **Kura Furniture**: `https://kura.yourdomain.com`
- **Vogue Clothing**: `https://vogue.yourdomain.com`
- **ChatAI**: `https://chat.yourdomain.com`
- **Analytics Dashboard**: `https://dashboard.yourdomain.com`

## Troubleshooting

### Domain not resolving
- Wait 24-48 hours for DNS propagation
- Check nameservers in Namecheap match Cloudflare
- Verify DNS records in Cloudflare

### SSL Certificate errors
- Ensure encryption mode is set to Full (strict)
- Wait a few minutes for certificate provisioning
- Check Edge Certificates in SSL/TLS settings

### Build failures
- Check build logs in Cloudflare Pages
- Verify Node version compatibility (v20.19.0)
- Ensure all dependencies are in package.json

## Continuous Deployment

Once set up, any push to your GitHub repository will automatically trigger a new deployment on Cloudflare Pages.

```bash
# Make changes
git add .
git commit -m "Update portfolio"
git push

# Cloudflare Pages will automatically rebuild and deploy
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Custom Domains Guide](https://developers.cloudflare.com/pages/platform/custom-domains/)
- [Build Configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)

---

**Need help?** Check Cloudflare's community forum or documentation for detailed troubleshooting.
