#!/bin/bash
# ─────────────────────────────────────────────────────
#  Deploy Nebula Eventos — correr en el EC2
#  Requisito: haber corrido setup-ec2.sh primero
# ─────────────────────────────────────────────────────
set -e

APP_DIR="/home/ubuntu/nebulaupgrade"

echo "▶ Entrando al directorio..."
cd "$APP_DIR"

echo "▶ Instalando dependencias..."
npm install

echo "▶ Generando cliente Prisma..."
npx prisma generate

echo "▶ Aplicando migraciones de base de datos..."
npx prisma db push

echo "▶ Construyendo la app..."
npm run build

echo "▶ Creando carpeta de logs..."
mkdir -p logs

echo "▶ Copiando .env.production como .env activo..."
cp .env.production .env

echo "▶ Configurando nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/nebula-eventos
sudo ln -sf /etc/nginx/sites-available/nebula-eventos /etc/nginx/sites-enabled/nebula-eventos
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "▶ Iniciando/reiniciando con PM2..."
pm2 delete nebula-eventos 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -1 | sudo bash

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Deploy completo"
echo "  App corriendo en: http://nebulaeventos.ddns.net"
echo "  Logs: pm2 logs nebula-eventos"
echo "  Status: pm2 status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
