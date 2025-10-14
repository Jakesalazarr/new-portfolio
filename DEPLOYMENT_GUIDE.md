# 🚀 Complete Cloudflare Pages Deployment Guide
## Jacob Salazar's Portfolio with Custom Domain & Subdomains

---

## 📋 What You'll Get

After following this guide, you'll have:
- **Main Portfolio**: `https://yourdomain.com`
- **Kura Furniture**: `https://kura.yourdomain.com`
- **Vogue Fashion**: `https://vogue.yourdomain.com`
- **ChatAI**: `https://chat.yourdomain.com`
- **Analytics Dashboard**: `https://dashboard.yourdomain.com`

All with FREE SSL certificates and automatic deployments!

---

## 🎯 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Deploy Main Portfolio to Cloudflare Pages** ⭐

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Click **"Pages"** in the left sidebar

2. **Create New Project**
   - Click **"Create a project"**
   - Click **"Connect to Git"**
   - Select **"GitHub"** (already connected)
   - Authorize Cloudflare if prompted

3. **Select Repository**
   - Find and select: **`Jakesalazarr/new-portfolio`**
   - Click **"Begin setup"**

4. **Configure Build Settings**
   ```
   Project name: jacob-salazar-portfolio
   Production branch: main
   Framework preset: None
   Build command: (leave empty)
   Build output directory: /
   ```

5. **Click "Save and Deploy"**
   - Wait 1-2 minutes for deployment
   - You'll get a URL like: `jacob-salazar-portfolio.pages.dev`

✅ **Done! Your main portfolio is live!**

---

### **STEP 2: Add Your Custom Domain to Cloudflare** 🌐

1. **Add Site to Cloudflare**
   - In Cloudflare Dashboard, click **"Websites"** → **"Add a site"**
   - Enter your Namecheap domain: `yourdomain.com`
   - Click **"Add site"**
   - Select **"Free"** plan → Click **"Continue"**

2. **Cloudflare will scan DNS records**
   - Review the records (you can keep them or delete later)
   - Click **"Continue"**

3. **Cloudflare will show you 2 nameservers** (example):
   ```
   asher.ns.cloudflare.com
   lucy.ns.cloudflare.com
   ```
   **⚠️ COPY THESE - you'll need them next!**

---

### **STEP 3: Update Nameservers in Namecheap** 📝

1. **Login to Namecheap**
   - Go to: https://www.namecheap.com/
   - Login to your account

2. **Manage Your Domain**
   - Click **"Domain List"**
   - Find your domain and click **"Manage"**

3. **Change Nameservers**
   - Scroll to **"Nameservers"** section
   - Select **"Custom DNS"**
   - Remove default nameservers
   - Add the 2 Cloudflare nameservers you copied:
     ```
     asher.ns.cloudflare.com
     lucy.ns.cloudflare.com
     ```
   - Click **"✓"** to save

4. **Wait for Propagation**
   - Usually takes 5-30 minutes (can take up to 24 hours)
   - Cloudflare will email you when it's active

---

### **STEP 4: Connect Custom Domain to Your Portfolio** 🔗

1. **Go Back to Cloudflare Pages**
   - Click **"Pages"** → Select **"jacob-salazar-portfolio"**

2. **Add Custom Domain**
   - Click **"Custom domains"** tab
   - Click **"Set up a custom domain"**
   - Enter your domain: `yourdomain.com`
   - Click **"Continue"**
   - Cloudflare will automatically configure DNS
   - Click **"Activate domain"**

3. **Add www subdomain (Optional)**
   - Click **"Set up a custom domain"** again
   - Enter: `www.yourdomain.com`
   - Click **"Continue"** → **"Activate domain"**

✅ **Done! Your portfolio is now at your custom domain!**

---

### **STEP 5: Deploy Individual Projects** 🎨

Now let's deploy each project to its own subdomain. You'll repeat this process 4 times (once for each project).

#### **5A. Deploy Kura Furniture Store** 🪑

1. Go to **Pages** → Click **"Create a project"**
2. Select **"Connect to Git"** → Choose **"Jakesalazarr/new-portfolio"**
3. Configure:
   ```
   Project name: kura-furniture
   Production branch: main
   Framework preset: Angular
   Root directory: 01-kura-angular
   Build command: npm install && npm run build
   Build output directory: dist/01-kura-angular/browser
   ```
4. Click **"Save and Deploy"**
5. Wait for deployment to complete

**Add Custom Domain:**
- Go to project → **"Custom domains"**
- Click **"Set up a custom domain"**
- Enter: `kura.yourdomain.com`
- Click **"Continue"** → **"Activate domain"**

✅ **Kura is live at: `https://kura.yourdomain.com`**

---

#### **5B. Deploy Vogue Fashion Store** 👗

1. **Pages** → **"Create a project"** → **"Jakesalazarr/new-portfolio"**
2. Configure:
   ```
   Project name: vogue-fashion
   Production branch: main
   Framework preset: React (Vite)
   Root directory: 02-vogue-react
   Build command: npm install && npm run build
   Build output directory: dist
   ```
3. Click **"Save and Deploy"**

**Add Custom Domain:**
- Go to project → **"Custom domains"**
- Enter: `vogue.yourdomain.com`
- **"Continue"** → **"Activate domain"**

✅ **Vogue is live at: `https://vogue.yourdomain.com`**

---

#### **5C. Deploy ChatAI Interface** 💬

1. **Pages** → **"Create a project"** → **"Jakesalazarr/new-portfolio"**
2. Configure:
   ```
   Project name: chatai-interface
   Production branch: main
   Framework preset: None
   Root directory: 03-chatai-python
   Build command: (leave empty)
   Build output directory: .
   ```
3. Click **"Save and Deploy"**

**Add Custom Domain:**
- Go to project → **"Custom domains"**
- Enter: `chat.yourdomain.com`
- **"Continue"** → **"Activate domain"**

✅ **ChatAI is live at: `https://chat.yourdomain.com`**

---

#### **5D. Deploy Analytics Dashboard** 📊

1. **Pages** → **"Create a project"** → **"Jakesalazarr/new-portfolio"**
2. Configure:
   ```
   Project name: analytics-dashboard
   Production branch: main
   Framework preset: Next.js
   Root directory: 04-analytics-dashboard
   Build command: npm install && npm run build
   Build output directory: .next
   ```
3. Click **"Save and Deploy"**

**Add Custom Domain:**
- Go to project → **"Custom domains"**
- Enter: `dashboard.yourdomain.com`
- **"Continue"** → **"Activate domain"**

✅ **Dashboard is live at: `https://dashboard.yourdomain.com`**

---

### **STEP 6: Enable Security & Performance** 🔒

1. **Go to your domain in Cloudflare** (not Pages)
   - Click **"Websites"** → Select your domain

2. **SSL/TLS Settings**
   - Click **"SSL/TLS"** → **"Overview"**
   - Set mode to: **"Full (strict)"**
   - Go to **"Edge Certificates"**
   - Enable:
     - ✅ Always Use HTTPS
     - ✅ Automatic HTTPS Rewrites
     - ✅ Opportunistic Encryption
     - Set **Minimum TLS Version**: 1.2

3. **Speed Optimizations**
   - Click **"Speed"** → **"Optimization"**
   - Enable:
     - ✅ Auto Minify (HTML, CSS, JS)
     - ✅ Brotli
     - ✅ Early Hints
     - ✅ HTTP/2

4. **Caching**
   - Click **"Caching"** → **"Configuration"**
   - Set **Browser Cache TTL**: 4 hours
   - Enable: ✅ Always Online

---

## 🎉 YOU'RE DONE!

Your portfolio is now live at:

- **Main Portfolio**: `https://yourdomain.com`
- **Kura Furniture**: `https://kura.yourdomain.com`
- **Vogue Fashion**: `https://vogue.yourdomain.com`
- **ChatAI**: `https://chat.yourdomain.com`
- **Analytics Dashboard**: `https://dashboard.yourdomain.com`

All sites have:
- ✅ FREE SSL certificates
- ✅ Automatic deployments (push to GitHub = auto deploy)
- ✅ Global CDN (fast worldwide)
- ✅ Unlimited bandwidth

---

## 🔄 How to Update Your Sites

Whenever you want to update your portfolio:

```bash
# Make your changes
git add .
git commit -m "Update portfolio design"
git push

# Cloudflare automatically rebuilds and deploys!
# No manual steps needed!
```

---

## ❓ Troubleshooting

### **Domain not working yet?**
- Wait 5-30 minutes for DNS propagation
- Check nameservers in Namecheap match Cloudflare
- Try in incognito/private mode

### **SSL Certificate error?**
- Wait 5-10 minutes for certificate provisioning
- Ensure SSL mode is "Full (strict)"
- Clear browser cache

### **Project not building?**
- Check build logs in Cloudflare Pages
- Verify Root directory path is correct
- Make sure package.json exists in project folder

### **Still need help?**
- Cloudflare Community: https://community.cloudflare.com/
- Cloudflare Docs: https://developers.cloudflare.com/pages/

---

## 📌 Quick Reference

### Cloudflare Dashboard URLs
- **Pages**: https://dash.cloudflare.com/pages
- **DNS**: https://dash.cloudflare.com/ → Select domain → DNS
- **SSL**: https://dash.cloudflare.com/ → Select domain → SSL/TLS

### Your GitHub Repository
- https://github.com/Jakesalazarr/new-portfolio

---

**🎨 Made with ❤️ by Jacob Salazar**
**🤖 Deployed with Claude Code**
