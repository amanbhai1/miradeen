#!/bin/bash
# ============================================================
# MIRADEEN - Production Deployment Script for Hostinger VPS
# ============================================================
# Run this script on your Hostinger VPS via SSH
# Usage: bash deploy.sh
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  MIRADEEN - Hostinger VPS Deployment     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ========================
# CONFIGURATION
# ========================
APP_NAME="miradeen"
APP_DIR="/home/$APP_NAME"
APP_PORT=3000
DOMAIN="yourdomain.com"  # ← CHANGE THIS

# ========================
# STEP 1: System Update
# ========================
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# ========================
# STEP 2: Install Node.js 20.x
# ========================
echo -e "${YELLOW}[2/10] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# ========================
# STEP 3: Install PM2
# ========================
echo -e "${YELLOW}[3/10] Installing PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo "PM2: $(pm2 -v)"

# ========================
# STEP 4: Install Nginx
# ========================
echo -e "${YELLOW}[4/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi
echo "Nginx: $(nginx -v 2>&1)"

# ========================
# STEP 5: Create App Directory
# ========================
echo -e "${YELLOW}[5/10] Setting up project directory...${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/db"
mkdir -p "$APP_DIR/logs"

# ========================
# STEP 6: Upload Project Files
# ========================
echo -e "${YELLOW}[6/10] Project files setup...${NC}"
echo -e "${RED}IMPORTANT: Upload your project to $APP_DIR${NC}"
echo "  Option A: Using SCP from your local machine:"
echo "    scp -r ./src ./prisma ./public ./package.json ./next.config.ts ./tsconfig.json ./postcss.config.mjs ./tailwind.config.ts $APP_DIR/"
echo ""
echo "  Option B: Using Git:"
echo "    cd $APP_DIR && git clone YOUR_REPO_URL ."
echo ""
echo -e "${YELLOW}Press Enter after you've uploaded the files...${NC}"
read -p ""

# ========================
# STEP 7: Install Dependencies & Build
# ========================
echo -e "${YELLOW}[7/10] Installing dependencies...${NC}"
cd "$APP_DIR"
npm install

echo -e "${YELLOW}Building for production...${NC}"
npm run build

# Copy static assets and public folder into standalone
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# ========================
# STEP 8: Database Setup
# ========================
echo -e "${YELLOW}[8/10] Setting up database...${NC}"

# Create .env file
cat > "$APP_DIR/.env" << ENVFILE
DATABASE_URL=file:$APP_DIR/db/custom.db
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
PORT=$APP_PORT
ENVFILE

echo -e "${GREEN}.env file created with secure JWT_SECRET${NC}"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run seed data
echo -e "${YELLOW}Seeding database with initial data...${NC}"
npx prisma db seed || echo "Seed completed or already seeded"

# ========================
# STEP 9: Configure PM2
# ========================
echo -e "${YELLOW}[9/10] Configuring PM2...${NC}"

# Stop existing app if running
pm2 delete "$APP_NAME" 2>/dev/null || true

# Start with PM2
pm2 start "$APP_DIR/.next/standalone/server.js" \
    --name "$APP_NAME" \
    --env production \
    -- --PORT $APP_PORT

# Save PM2 config
pm2 save
pm2 startup

echo -e "${GREEN}PM2 process started${NC}"
echo "App URL: http://localhost:$APP_PORT"

# ========================
# STEP 10: Configure Nginx
# ========================
echo -e "${YELLOW}[10/10] Configuring Nginx...${NC}"

# Create Nginx config
sudo tee "/etc/nginx/sites-available/$APP_NAME" > /dev/null << NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Static assets
    location /_next/static {
        alias $APP_DIR/.next/standalone/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

# Enable site
sudo ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  DEPLOYMENT COMPLETE!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "App running at: ${GREEN}http://$DOMAIN${NC}"
echo -e "Admin login: ${YELLOW}admin@miradeen.com / admin123${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs $APP_NAME     # View logs"
echo "  pm2 restart $APP_NAME  # Restart app"
echo "  pm2 stop $APP_NAME     # Stop app"
echo "  sudo nginx -t          # Test Nginx config"
echo "  sudo systemctl reload nginx  # Reload Nginx"
