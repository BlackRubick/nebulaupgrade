#!/bin/bash
# ─────────────────────────────────────────────────────
#  Setup Nebula Eventos en AWS EC2 (Ubuntu)
#  Dominio: nebulaeventos.ddns.net  |  IP: 100.49.147.27
# ─────────────────────────────────────────────────────
set -e

echo "▶ Actualizando paquetes..."
sudo apt update && sudo apt upgrade -y

# ── Node.js 20 ──────────────────────────────────────
echo "▶ Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ── PM2 ─────────────────────────────────────────────
echo "▶ Instalando PM2..."
sudo npm install -g pm2

# ── Nginx ───────────────────────────────────────────
echo "▶ Instalando Nginx..."
sudo apt install -y nginx

# ── MySQL ───────────────────────────────────────────
echo "▶ Instalando MySQL..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

echo ""
echo "⚠  Ahora ejecuta: sudo mysql_secure_installation"
echo "⚠  Luego crea el usuario y base de datos:"
echo "   sudo mysql -u root -p"
echo "   CREATE DATABASE nebula_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'cesar'@'localhost' IDENTIFIED BY 'cesar123';"
echo "   GRANT ALL PRIVILEGES ON nebula_eventos.* TO 'cesar'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""

# ── Directorio de la app ─────────────────────────────
echo "▶ Creando directorio /var/www/nebula-eventos..."
sudo mkdir -p /var/www/nebula-eventos
sudo chown -R ubuntu:ubuntu /var/www/nebula-eventos

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Instalación base lista. Continúa con deploy.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
