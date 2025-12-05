# 🚀 Despliegue en Vercel

Este documento describe cómo desplegar la API en Vercel.

## ⚠️ Limitaciones de Vercel

**IMPORTANTE**: Vercel está optimizado para funciones serverless y tiene las siguientes limitaciones:

- ⏱️ **Timeout**: 10 segundos en plan gratuito (60s en Pro)
- 📦 **Response size**: Máximo 4.5 MB
- ❄️ **Cold starts**: Primera petición puede ser lenta
- 💾 **Sin filesystem persistente**: Los logs no se guardan en archivos
- 🔌 **Sin conexiones persistentes**: WebSockets no soportados

## 📋 Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. CLI de Vercel instalado:
   ```bash
   npm i -g vercel
   ```

## 🔧 Configuración

### 1. Variables de Entorno

Debes configurar las siguientes variables en Vercel:

```bash
# En el dashboard de Vercel o via CLI:
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add BCRYPT_SALT_ROUNDS
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

**IMPORTANTE**: Para `DATABASE_URL`, asegúrate de usar:
- Supabase Session Pooler (puerto 5432, IPv4)
- O connection pooling de otra plataforma
- Formato: `postgresql://user:password@host:5432/database`

### 2. Base de Datos

**Ejecutar migraciones** antes del primer despliegue:

```bash
# Opción 1: Desde tu máquina local
npx prisma migrate deploy

# Opción 2: Conectarte a la BD y ejecutar SQL directamente
# (ver archivos en prisma/migrations/)
```

## 🚀 Despliegue

### Opción 1: CLI

```bash
# Login en Vercel
vercel login

# Primer despliegue (modo preview)
vercel

# Despliegue a producción
vercel --prod
```

### Opción 2: GitHub Integration

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno
5. Click en "Deploy"

## 🔍 Verificación

Una vez desplegado:

```bash
# Reemplaza YOUR_APP_URL con tu URL de Vercel
curl https://your-app.vercel.app/health

# Deberías recibir: {"ok":true}
```

## 📚 API Docs

La documentación Swagger estará disponible en:
```
https://your-app.vercel.app/api-docs
```

## ⚡ Optimizaciones Aplicadas

Este proyecto ya incluye las siguientes optimizaciones para Vercel:

1. **Logger adaptativo**: Desactiva logs a archivo cuando `VERCEL=1`
2. **Export condicional**: Exporta `app` directamente en serverless
3. **Prisma optimizado**: `prisma generate` en build step
4. **Archivos ignorados**: `.vercelignore` reduce el tamaño del bundle

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solución**: Usa Supabase Session Pooler (IPv4):
```
postgresql://user:password@host.pooler.supabase.com:5432/postgres
```

### Error: "Function execution timed out"

**Problema**: Petición tarda más de 10 segundos.

**Soluciones**:
- Optimiza queries de Prisma (usa `select`, `include` con cuidado)
- Considera usar Vercel Pro (60s timeout)
- Evalúa usar Railway/Render para APIs de larga duración

### Error: "Response size exceeds limit"

**Problema**: Response mayor a 4.5 MB.

**Soluciones**:
- Implementa paginación en endpoints
- Reduce tamaño de respuestas
- Usa compresión (gzip)

### Logs no aparecen

**Problema**: Los logs de Winston no se guardan.

**Solución**: 
- Los logs van a la consola de Vercel (accesible en dashboard)
- Para logs persistentes, integra un servicio externo:
  - [Logtail](https://logtail.com/)
  - [Papertrail](https://papertrailapp.com/)
  - [Datadog](https://www.datadoghq.com/)

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel ls

# Eliminar proyecto
vercel remove

# Ver variables de entorno
vercel env ls
```

## 🔗 Enlaces Útiles

- [Documentación de Vercel Node.js](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Prisma en Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Última actualización**: Diciembre 2025 (v1.2.0)

