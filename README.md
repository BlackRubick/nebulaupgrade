# NEBULA EVENTOS — Guía de Deploy en AWS EC2

> **Dominio:** nebulaeventos.ddns.net  
> **IP Elástica:** 100.49.147.27  
> **Stack:** Nuxt 4 · Prisma · MySQL · Nginx · PM2 · Certbot

---

## Requisitos previos en AWS

Antes de conectarte al servidor, asegúrate de tener esto en la consola de AWS:

### Security Group — puertos abiertos
Ve a **EC2 → Security Groups → Inbound rules** y agrega:

| Tipo  | Protocolo | Puerto | Origen    |
|-------|-----------|--------|-----------|
| SSH   | TCP       | 22     | Tu IP     |
| HTTP  | TCP       | 80     | 0.0.0.0/0 |
| HTTPS | TCP       | 443    | 0.0.0.0/0 |

### IP elástica asociada
Verifica que la IP `100.49.147.27` esté asociada a tu instancia en **EC2 → Elastic IPs**.

---

## Paso 1 — Conectarse al EC2

```bash
ssh ubuntu@100.49.147.27
```

Si tienes llave `.pem`:
```bash
ssh -i ~/tu-llave.pem ubuntu@100.49.147.27
```

---

## Paso 2 — Instalar dependencias del servidor

Corre esto en el EC2 (una sola vez):

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (gestor de procesos)
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# MySQL
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# Certbot (SSL con Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Git
sudo apt install -y git
```

---

## Paso 3 — Configurar MySQL

```bash
# Entrar a MySQL como root
sudo mysql

# Dentro de MySQL, ejecutar:
CREATE DATABASE nebula_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cesar'@'localhost' IDENTIFIED BY 'cesar123';
GRANT ALL PRIVILEGES ON nebula_eventos.* TO 'cesar'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Paso 4 — Subir el proyecto

### Opción A — desde tu Mac con rsync
```bash
# Correr en tu Mac, dentro de la carpeta del proyecto
rsync -avz \
  --exclude node_modules \
  --exclude .output \
  --exclude .nuxt \
  /Users/blackrubick/Desktop/Nebula-eventos/ \
  ubuntu@100.49.147.27:/var/www/nebula-eventos/
```

### Opción B — clonar desde GitHub
```bash
# En el EC2
sudo mkdir -p /var/www/nebula-eventos
sudo chown -R ubuntu:ubuntu /var/www/nebula-eventos
cd /var/www/nebula-eventos
git clone https://github.com/tu-usuario/tu-repo.git .
```

---

## Paso 5 — Configurar variables de entorno

En el EC2, crea el archivo `.env` de producción:

```bash
nano /var/www/nebula-eventos/.env.production
```

Contenido (ya viene en el proyecto, solo verifica):
```env
DATABASE_URL="mysql://cesar:cesar123@localhost:3306/nebula_eventos"
JWT_SECRET="NeBuLa-Pr0d-JWT-S3cr3t-Cambiar-Esto-2025!#@"
JWT_REFRESH_SECRET="NeBuLa-Pr0d-R3fresh-S3cr3t-Cambiar-Esto-2025!#@"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="production"
APP_URL="https://nebulaeventos.ddns.net"
```

> ⚠️ Cambia los valores de JWT_SECRET y JWT_REFRESH_SECRET por cadenas largas y aleatorias antes de producción.

---

## Paso 6 — Instalar dependencias y build

```bash
cd /var/www/nebula-eventos

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# Construir la app
cp .env.production .env
npm run build

# Crear carpeta de logs
mkdir -p logs
```

---

## Paso 7 — Configurar Nginx (HTTP primero)

```bash
# Copiar la config del proyecto
sudo cp /var/www/nebula-eventos/nginx.conf /etc/nginx/sites-available/nebula-eventos

# Activar el sitio
sudo ln -sf /etc/nginx/sites-available/nebula-eventos /etc/nginx/sites-enabled/nebula-eventos

# Desactivar el sitio por defecto
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar que la config esté bien
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

En este punto la app debería abrir en `http://nebulaeventos.ddns.net`.

---

## Paso 8 — SSL con Certbot (HTTPS)

```bash
# Obtener certificado SSL gratuito de Let's Encrypt
sudo certbot --nginx -d nebulaeventos.ddns.net
```

Certbot te va a preguntar:
- Tu email (para notificaciones de renovación)
- Si aceptas los términos (Y)
- Si quieres redirigir HTTP → HTTPS (elige **2** para redirigir, recomendado)

Certbot modifica automáticamente el nginx.conf para agregar HTTPS.

### Verificar que el certificado se renueva solo

```bash
# Probar la renovación automática
sudo certbot renew --dry-run
```

El certificado se renueva automáticamente cada 90 días.

### Actualizar APP_URL a HTTPS

Una vez que tengas SSL, actualiza tu `.env` y reconstruye:

```bash
cd /var/www/nebula-eventos

# Cambiar APP_URL en .env
sed -i 's|APP_URL="http://|APP_URL="https://|' .env

# También en .env.production
sed -i 's|APP_URL="http://|APP_URL="https://|' .env.production

# Reconstruir con la URL correcta
npm run build
```

---

## Paso 9 — Iniciar con PM2

```bash
cd /var/www/nebula-eventos

# Iniciar la app
pm2 start ecosystem.config.cjs

# Guardar la lista de procesos (para que sobreviva reinicios)
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
# Copia y ejecuta el comando que te muestra (empieza con sudo env PATH=...)
```

---

## Comandos útiles de PM2

```bash
# Ver estado de la app
pm2 status

# Ver logs en tiempo real
pm2 logs nebula-eventos

# Reiniciar la app
pm2 restart nebula-eventos

# Detener la app
pm2 stop nebula-eventos

# Recargar sin downtime (tras un nuevo build)
pm2 reload nebula-eventos
```

---

## Paso 10 — Verificar que todo funciona

```bash
# Ver si nginx corre bien
sudo systemctl status nginx

# Ver si MySQL corre bien
sudo systemctl status mysql

# Ver si la app corre en el puerto 3000
curl http://localhost:3000

# Ver si nginx redirige correctamente
curl -I http://nebulaeventos.ddns.net
```

Abre en el navegador: **https://nebulaeventos.ddns.net**

---

## Actualizar la app (futuros deploys)

Cada vez que hagas cambios y quieras subir una nueva versión:

```bash
# Desde tu Mac — subir cambios
rsync -avz \
  --exclude node_modules \
  --exclude .output \
  --exclude .nuxt \
  /Users/blackrubick/Desktop/Nebula-eventos/ \
  ubuntu@100.49.147.27:/var/www/nebula-eventos/

# En el EC2 — reconstruir y recargar
cd /var/www/nebula-eventos
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 reload nebula-eventos
```

---

## Estructura de archivos importantes

```
/var/www/nebula-eventos/
├── .env                    ← Variables de entorno activas (producción)
├── .env.production         ← Plantilla de producción
├── ecosystem.config.cjs    ← Configuración de PM2
├── nginx.conf              ← Configuración de Nginx
├── .output/                ← Build de producción (generado por npm run build)
│   └── server/
│       └── index.mjs       ← Punto de entrada del servidor
└── prisma/
    └── schema.prisma       ← Esquema de la base de datos
```

---

## Solución de problemas

### La app no carga
```bash
pm2 logs nebula-eventos --lines 50   # revisar logs de la app
sudo journalctl -u nginx -n 50       # revisar logs de nginx
```

### Error de base de datos
```bash
sudo systemctl status mysql          # verificar que MySQL corre
mysql -u cesar -p nebula_eventos     # probar conexión manual
```

### Error de permisos
```bash
sudo chown -R ubuntu:ubuntu /var/www/nebula-eventos
```

### Nginx no recarga
```bash
sudo nginx -t                        # verificar sintaxis de config
sudo systemctl restart nginx         # reiniciar nginx completo
```

### El QR genera links con http en lugar de https
Verifica que en `.env` el `APP_URL` tenga `https://`:
```bash
grep APP_URL /var/www/nebula-eventos/.env
# Debe decir: APP_URL="https://nebulaeventos.ddns.net"
```
Si no, cámbialo y reconstruye con `npm run build` + `pm2 reload nebula-eventos`.

---

## Resumen del flujo completo

```
Mac (desarrollo)
    │
    │  rsync
    ▼
EC2 Ubuntu
    ├── MySQL 8          (base de datos)
    ├── Node.js 20
    │     └── Nuxt app   (puerto 3000, manejado por PM2)
    └── Nginx            (puerto 80/443, reverse proxy)
          ├── HTTP  :80  → redirige a HTTPS
          └── HTTPS :443 → proxy a localhost:3000
                │
                └── nebulaeventos.ddns.net (Let's Encrypt SSL)
```
