# ⚡ QUICK START - Deploy in 15 Minutes

## 🎯 What You Need
1. Your Namecheap domain name
2. Cloudflare account (already connected to GitHub ✅)
3. This checklist

---

## ✅ DEPLOYMENT CHECKLIST

### **Part 1: Main Portfolio (5 minutes)**
- [ ] Go to https://dash.cloudflare.com/pages
- [ ] Click "Create a project" → "Connect to Git"
- [ ] Select `Jakesalazarr/new-portfolio`
- [ ] Set project name: `jacob-salazar-portfolio`
- [ ] Leave build settings empty
- [ ] Click "Save and Deploy"
- [ ] Wait for deployment ✅

### **Part 2: Add Your Domain (5 minutes)**
- [ ] In Cloudflare: Websites → "Add a site"
- [ ] Enter your Namecheap domain
- [ ] Select "Free" plan
- [ ] **COPY THE 2 NAMESERVERS** shown
- [ ] Go to Namecheap → Domain List → Manage
- [ ] Change to "Custom DNS"
- [ ] Paste the 2 Cloudflare nameservers
- [ ] Save and wait 5-30 minutes ⏰

### **Part 3: Connect Domain to Portfolio (2 minutes)**
- [ ] Go back to Pages → Your project → "Custom domains"
- [ ] Click "Set up a custom domain"
- [ ] Enter your domain: `yourdomain.com`
- [ ] Click "Continue" → "Activate"
- [ ] Done! Your portfolio is live! 🎉

### **Part 4: Deploy Projects (3 minutes each)**

**For Each Project, repeat:**
1. Pages → "Create a project" → Select `Jakesalazarr/new-portfolio`
2. Use these settings:

| Project | Name | Root Dir | Build Command | Output Dir |
|---------|------|----------|---------------|------------|
| **Kura** | kura-furniture | 01-kura-angular | npm install && npm run build | dist/01-kura-angular/browser |
| **Vogue** | vogue-fashion | 02-vogue-react | npm install && npm run build | dist |
| **ChatAI** | chatai-interface | 03-chatai-python | (empty) | . |
| **Dashboard** | analytics-dashboard | 04-analytics-dashboard | npm install && npm run build | .next |

3. After each deploys → "Custom domains" → Add subdomain:
   - Kura: `kura.yourdomain.com`
   - Vogue: `vogue.yourdomain.com`
   - ChatAI: `chat.yourdomain.com`
   - Dashboard: `dashboard.yourdomain.com`

---

## 🎉 FINAL RESULT

After completing the checklist, you'll have:

```
https://yourdomain.com              → Main Portfolio
https://kura.yourdomain.com         → Kura Furniture Store
https://vogue.yourdomain.com        → Vogue Fashion
https://chat.yourdomain.com         → ChatAI Interface
https://dashboard.yourdomain.com    → Analytics Dashboard
```

All with FREE SSL, auto-deployments, and global CDN! 🚀

---

## 🆘 Quick Fixes

**Domain not working?**
→ Wait 30 minutes, try incognito mode

**Build failed?**
→ Check Root directory spelling
→ Verify Framework preset matches project type

**Need detailed help?**
→ Read `DEPLOYMENT_GUIDE.md` (full instructions)

---

**Total Time: ~15 minutes** ⏱️
**Difficulty: Easy** 😊
**Cost: $0 (FREE!)** 💰
