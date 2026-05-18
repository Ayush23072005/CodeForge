#!/bin/bash
# ============================================================
#  CodeForge — One-Click AWS EC2 Deployment Script
#  Run this on a fresh Ubuntu 24.04 EC2 instance
#  Usage: chmod +x deploy.sh && sudo ./deploy.sh
# ============================================================

set -e  # Exit on any error

echo "
╔══════════════════════════════════════════╗
║     ⚡ CodeForge Cloud Deployment        ║
╚══════════════════════════════════════════╝
"

# ── 1. System Updates ────────────────────────────────────────
echo "📦 [1/7] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ── 2. Install Docker ────────────────────────────────────────
echo "🐳 [2/7] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
    rm get-docker.sh
    echo "   ✅ Docker installed"
else
    echo "   ✅ Docker already installed"
fi

# ── 3. Install Node.js 20 ───────────────────────────────────
echo "📗 [3/7] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "   ✅ Node.js $(node -v) installed"
else
    echo "   ✅ Node.js $(node -v) already installed"
fi

# ── 4. Install Nginx ────────────────────────────────────────
echo "🌐 [4/7] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
echo "   ✅ Nginx installed"

# ── 5. Clone & Setup Project ────────────────────────────────
echo "📂 [5/7] Setting up project..."
PROJECT_DIR="/opt/codeforge"

if [ -d "$PROJECT_DIR" ]; then
    echo "   ⚠️  Project directory exists. Pulling latest..."
    cd "$PROJECT_DIR" && git pull || true
else
    echo "   ⚠️  IMPORTANT: You need to copy the project files to $PROJECT_DIR"
    echo "   Run: scp -r -i your-key.pem ./cc_project ubuntu@<EC2-IP>:/opt/codeforge"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Install backend dependencies
echo "   Installing backend dependencies..."
cd backend && npm ci --only=production && cd ..

# Build frontend for production
echo "   Building frontend..."
cd frontend && npm ci && npm run build && cd ..

# ── 6. Build Docker Execution Images ────────────────────────
echo "🐳 [6/7] Building Docker execution images (this takes 5-15 min)..."
docker build -t codeforge-python ./docker/python/
echo "   ✅ Python image built"
docker build -t codeforge-cpp ./docker/cpp/
echo "   ✅ C++ image built"
docker build -t codeforge-java ./docker/java/
echo "   ✅ Java image built"

# ── 7. Configure Services ───────────────────────────────────
echo "⚙️  [7/7] Configuring services..."

# Copy Nginx config
cp deploy/nginx.conf /etc/nginx/sites-available/codeforge
ln -sf /etc/nginx/sites-available/codeforge /etc/nginx/sites-enabled/codeforge
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "   ✅ Nginx configured"

# Copy systemd service
cp deploy/codeforge.service /etc/systemd/system/codeforge.service
systemctl daemon-reload
systemctl enable codeforge
systemctl start codeforge
echo "   ✅ CodeForge service started"

# Get the public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo "
╔══════════════════════════════════════════════╗
║         ✅ Deployment Complete!               ║
║──────────────────────────────────────────────║
║  URL:  http://$PUBLIC_IP                      
║                                              ║
║  Useful commands:                            ║
║  • sudo systemctl status codeforge           ║
║  • sudo journalctl -u codeforge -f           ║
║  • sudo systemctl restart codeforge          ║
║  • sudo nginx -t && sudo systemctl restart nginx ║
╚══════════════════════════════════════════════╝
"
