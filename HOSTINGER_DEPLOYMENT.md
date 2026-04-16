# MIRADEEN - Hostinger VPS Deployment Guide

## 🎯 Overview

This guide covers deploying MIRADEEN luxury women's fashion e-commerce platform to a **Hostinger VPS** with Node.js, Nginx, PM2, and SQLite database.

---

## 📋 Prerequisites

1. **Hostinger VPS Plan** (KVM 1 or higher recommended)
   - Minimum: 2 vCPU, 2GB RAM, 40GB SSD
   - Recommended: 4 vCPU, 4GB RAM, 80GB SSD
2. A **domain name** (optional but recommended)
3. SSH access to your VPS
4. Your project files ready to upload

---

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Your VPS via SSH

```bash
ssh root@YOUR_VPS_IP_ADDRESS
```
*(You'll find the IP in your Hostinger VPS dashboard)*

### Step 2: Upload Your Project Files

**Option A — Using SCP (from your local machine):**
```bash
# On your LOCAL machine, create a deployment package
cd /home/z/my-project
tar czf miradeen-deploy.tar.gz \
  src/ prisma/ public/ \
  package.json package-lock.json bun.lock \
  next.config.ts tsconfig.json \
  postcss.config.mjs tailwind.config.ts \
  ecosystem.config.js

# Upload to VPS
scp miradeen-deploy.tar.gz root@YOUR_VPS_IP:/root/

# On VPS, extract
mkdir -p /home/miradeen
cd /home/miradeen
tar xzf /root/miradeen-deploy.tar.gz
```

**Option B — Using Git:**
```bash
cd /home/miradeen
git clone YOUR_GITHUB_REPO_URL .
```

**Option C — Using the auto-deploy script:**
```bash
# Copy deploy.sh to VPS
scp deploy.sh root@YOUR_VPS_IP:/root/
# Then SSH in and run it
ssh root@YOUR_VPS_IP
bash deploy.sh
```

### Step 3: Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # Should show v20.x.x
npm -v
```

### Step 4: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 -v
```

### Step 5: Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
nginx -v
```

### Step 6: Install Dependencies & Build

```bash
cd /home/miradeen
npm install
npm run build

# Copy static files into standalone output
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

### Step 7: Setup Environment Variables

```bash
cat > /home/miradeen/.env << 'EOF'
DATABASE_URL=file:/home/miradeen/db/custom.db
JWT_SECRET=GENERATE_A_LONG_RANDOM_STRING_HERE
NODE_ENV=production
PORT=3000
EOF

# Generate a secure JWT secret
openssl rand -hex 32
# Replace GENERATE_A_LONG_RANDOM_STRING_HERE with the output
```

### Step 8: Setup Database

```bash
cd /home/miradeen
mkdir -p db

# Generate Prisma client
npx prisma generate

# Push schema to create database
npx prisma db push

# Seed with initial data (admin user, products, categories, coupons)
npx prisma db seed
```

> **Default Login:** `admin@miradeen.com` / `admin123`

### Step 9: Start App with PM2

```bash
cd /home/miradeen
pm2 start .next/standalone/server.js --name miradeen
pm2 save
pm2 startup    # Auto-start on server reboot
```

### Step 10: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/miradeen
```

Paste this (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript image/svg+xml;

    location /_next/static {
        alias /home/miradeen/.next/standalone/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -sf /etc/nginx/sites-available/miradeen /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t          # Test config
sudo systemctl reload nginx
```

### Step 11: Setup SSL (HTTPS) with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow the prompts to activate HTTPS
```

Auto-renewal is set up automatically. Verify:
```bash
sudo certbot renew --dry-run
```

---

## 📊 Daily Management Commands

```bash
# App Management
pm2 logs miradeen          # View real-time logs
pm2 restart miradeen       # Restart the app
pm2 stop miradeen          # Stop the app
pm2 monit                  # Monitor CPU/Memory

# Database Management
cd /home/miradeen
npx prisma db push         # Apply schema changes
npx prisma db seed         # Re-seed data
npx prisma studio          # Open database browser (on port 5555)

# Nginx
sudo nginx -t              # Test config
sudo systemctl reload nginx  # Reload config

# Server Updates
sudo apt update && sudo apt upgrade -y
```

---

## 🔄 Updating the App

When you make changes to the project:

```bash
# On your local machine — upload new files
cd /home/z/my-project
tar czf miradeen-update.tar.gz src/ prisma/ public/ package.json next.config.ts
scp miradeen-update.tar.gz root@YOUR_VPS_IP:/root/

# On the VPS
cd /home/miradeen
tar xzf /root/miradeen-update.tar.gz
npm install
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
npx prisma generate
npx prisma db push    # If schema changed
pm2 restart miradeen
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| **502 Bad Gateway** | `pm2 restart miradeen` and check `pm2 logs` |
| **App not starting** | Check `.env` file, ensure `DATABASE_URL` is correct |
| **Database errors** | Run `npx prisma generate && npx prisma db push` |
| **Nginx errors** | Run `sudo nginx -t` to test config |
| **Permission denied** | `sudo chown -R $USER:$USER /home/miradeen` |
| **Out of memory** | Upgrade VPS plan or add swap: `sudo fallocate -l 2G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |
| **Port already in use** | `sudo lsof -i :3000` then `kill -9 PID` |

---

## 📁 File Structure on VPS

```
/home/miradeen/
├── .env                    # Environment variables (JWT_SECRET, DB path)
├── .next/
│   └── standalone/
│       ├── server.js       # Production server entry
│       └── .next/static/   # Built static assets
├── db/
│   └── custom.db           # SQLite database
├── logs/                   # PM2 logs
├── prisma/
│   └── schema.prisma       # Database schema
├── public/                 # Static files (images, favicon)
└── src/                    # Source code
```

---

## 💰 Recommended Hostinger VPS Plans

| Plan | vCPU | RAM | SSD | Price | Suitable |
|------|------|-----|-----|-------|----------|
| KVM 1 | 1 | 4GB | 50GB | ~$5/mo | Development/Staging |
| KVM 2 | 2 | 8GB | 100GB | ~$10/mo | ✅ Recommended |
| KVM 4 | 4 | 8GB | 200GB | ~$18/mo | High Traffic |

---

## ⚠️ Important Notes

1. **Change JWT_SECRET** — Generate a unique secret with `openssl rand -hex 32`
2. **Change admin password** — After first login, update the admin email/password
3. **Backups** — Regularly backup `db/custom.db` file
4. **Security** — Keep Node.js and system packages updated
5. **Monitoring** — Use `pm2 monit` to watch memory/CPU usage
6. **Domain DNS** — Point your domain's A record to your VPS IP in Hostinger DNS settings
