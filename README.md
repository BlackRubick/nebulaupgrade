# NEBULA EVENTOS — Deploy en AWS EC2

> **Ruta del proyecto:** `/home/ubuntu/nebulaupgrade`  
> **Dominio:** nebulaeventos.ddns.net  
> **IP Elástica:** 100.49.147.27  
> **Stack:** Nuxt 4 · Prisma · MySQL · Nginx · PM2 · Certbot

---

## Antes de empezar — Puertos en AWS

Ve a **EC2 → Security Groups → Inbound rules** y asegúrate de tener:

| Tipo  | Puerto | Origen    |
|-------|--------|-----------|
| SSH   | 22     | Tu IP     |
| HTTP  | 80     | 0.0.0.0/0 |
| HTTPS | 443    | 0.0.0.0/0 |

---

## Paso 1 — Instalar dependencias del servidor

Conéctate al EC2 y corre esto **una sola vez**:

```bash
ssh ubuntu@100.49.147.27

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# MySQL
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

---

## Paso 2 — Configurar MySQL

```bash
sudo mysql
```

Dentro de MySQL ejecuta:

```sql
CREATE DATABASE nebula_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cesar'@'localhost' IDENTIFIED BY 'cesar123';
GRANT ALL PRIVILEGES ON nebula_eventos.* TO 'cesar'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Paso 3 — Crear archivo .env

El repositorio ya está clonado en `/home/ubuntu/nebulaupgrade`. Solo crea el `.env`:

```bash
cd /home/ubuntu/nebulaupgrade

nano .env
```

Pega esto exactamente:

```env
DATABASE_URL="mysql://cesar:cesar123@localhost:3306/nebula_eventos"
JWT_SECRET="NeBuLa-Pr0d-JWT-S3cr3t-Cambiar-Esto-2025!#@"
JWT_REFRESH_SECRET="NeBuLa-Pr0d-R3fresh-S3cr3t-Cambiar-Esto-2025!#@"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="production"
APP_URL="http://nebulaeventos.ddns.net"
```

> Guarda con `Ctrl+O`, `Enter`, luego `Ctrl+X`.

---

## Paso 4 — Instalar dependencias y build

```bash
cd /home/ubuntu/nebulaupgrade

npm install

npx prisma generate

npx prisma db push

npm run build

mkdir -p logs
```

---

## Paso 5 — Configurar Nginx

```bash
# Copiar la config que ya viene en el proyecto
sudo cp /home/ubuntu/nebulaupgrade/nginx.conf /etc/nginx/sites-available/nebula-eventos

# Activar el sitio
sudo ln -sf /etc/nginx/sites-available/nebula-eventos /etc/nginx/sites-enabled/nebula-eventos

# Quitar el sitio por defecto de nginx
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar que no haya errores
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

En este punto ya debe abrir en `http://nebulaeventos.ddns.net` ✅

---

## Paso 6 — SSL con Certbot (HTTPS gratis)

```bash
sudo certbot --nginx -d nebulaeventos.ddns.net
```

El instalador te pregunta:
1. **Email** → escribe el tuyo
2. **Terms of service** → `Y`
3. **Redirect HTTP to HTTPS** → elige `2` (redirigir, recomendado)

Certbot configura nginx automáticamente y el sitio ya queda con HTTPS. ✅

### Actualizar APP_URL a HTTPS después de Certbot

```bash
cd /home/ubuntu/nebulaupgrade

# Editar .env y cambiar http por https
nano .env
# Cambia: APP_URL="https://nebulaeventos.ddns.net"

# Reconstruir para que los QR usen https
npm run build

# Recargar nginx
sudo systemctl reload nginx
```

### Renovación automática del certificado

Certbot ya configura un cron automático. Para verificarlo:

```bash
sudo certbot renew --dry-run
```

---

## Paso 7 — Iniciar la app con PM2

```bash
cd /home/ubuntu/nebulaupgrade

# Iniciar la app
pm2 start ecosystem.config.cjs

# Ver que esté corriendo
pm2 status

# Guardar para que sobreviva reinicios del servidor
pm2 save

# Configurar arranque automático (copia y pega el comando que aparece)
pm2 startup
```

La app ya está corriendo en **https://nebulaeventos.ddns.net** ✅

---

## Comandos del día a día

```bash
# Ver si la app está viva
pm2 status

# Ver logs en tiempo real
pm2 logs nebula-eventos

# Reiniciar la app
pm2 restart nebula-eventos

# Recargar sin cortar conexiones (tras un nuevo build)
pm2 reload nebula-eventos
```

---

## Actualizar la app (cuando hagas cambios)

Cuando subas nuevos cambios al repo desde tu Mac:

```bash
cd /home/ubuntu/nebulaupgrade

# Bajar los últimos cambios
git pull

# Instalar nuevas dependencias si las hay
npm install

# Si cambiaste el schema de prisma
npx prisma generate
npx prisma db push

# Reconstruir
npm run build

# Recargar sin downtime
pm2 reload nebula-eventos
```

---

## Solución de problemas

### La app no carga
```bash
pm2 logs nebula-eventos --lines 50
sudo systemctl status nginx
```

### Error de base de datos
```bash
sudo systemctl status mysql
mysql -u cesar -pcesar123 nebula_eventos
```

### Nginx no inicia
```bash
sudo nginx -t          # muestra exactamente qué está mal
sudo systemctl restart nginx
```

### Los QR tienen http en vez de https
```bash
grep APP_URL /home/ubuntu/nebulaupgrade/.env
# Si dice http, cámbialo a https y corre: npm run build && pm2 reload nebula-eventos
```

### Ver que el puerto 3000 está activo
```bash
curl http://localhost:3000
```

---

## Resumen visual

```
Internet
    │
    ▼
Nginx (puerto 443 HTTPS / 80 redirige)
    │  nebulaeventos.ddns.net → 100.49.147.27
    │
    ▼
Nuxt App (localhost:3000, manejada por PM2)
    │  /home/ubuntu/nebulaupgrade/.output/server/index.mjs
    │
    ▼
MySQL (localhost:3306)
    nebula_eventos
```
