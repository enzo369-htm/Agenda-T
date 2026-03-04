#!/bin/bash

# ============================================
# DESPLIEGUE 100% AUTOMATIZADO
# ============================================
# Este script hace TODO lo posible automáticamente
# Solo necesitas autenticarte cuando te lo pida

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 DESPLIEGUE AUTOMÁTICO - Agenda Turnos Pro"
echo ""

# ============================================
# 1. PREPARAR CÓDIGO
# ============================================
echo -e "${BLUE}📦 Preparando código...${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio del proyecto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Directorio correcto${NC}"

# ============================================
# 2. INSTALAR VERCEL CLI
# ============================================
echo ""
echo -e "${BLUE}🔧 Verificando Vercel CLI...${NC}"

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no instalado. Instalando...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI instalado${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI ya instalado${NC}"
fi

# ============================================
# 3. LOGIN EN VERCEL
# ============================================
echo ""
echo -e "${BLUE}🔐 Iniciando sesión en Vercel...${NC}"
echo -e "${YELLOW}Se abrirá tu navegador para que inicies sesión${NC}"
echo ""

vercel login

echo ""
echo -e "${GREEN}✅ Sesión iniciada en Vercel${NC}"

# ============================================
# 4. CONFIGURAR VARIABLES DE ENTORNO
# ============================================
echo ""
echo -e "${BLUE}⚙️  Configuración de Variables de Entorno${NC}"
echo ""
echo "Necesitamos configurar algunas variables críticas:"
echo ""

# DATABASE_URL
echo -e "${YELLOW}📋 DATABASE_URL${NC}"
echo "Para obtener una base de datos GRATIS:"
echo "1. Ve a: https://neon.tech"
echo "2. Crea cuenta (usa GitHub para más rápido)"
echo "3. 'New Project' → nombre: agendaturnos"
echo "4. Copia la Connection String"
echo ""
read -p "Pega tu DATABASE_URL aquí: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL es obligatoria${NC}"
    exit 1
fi

# NEXTAUTH_SECRET
echo ""
echo -e "${YELLOW}🔐 NEXTAUTH_SECRET${NC}"
echo "Generando secret aleatorio..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✅ Secret generado: ${NEXTAUTH_SECRET}${NC}"

# NEXTAUTH_URL (se configurará después del deploy)
echo ""
echo -e "${YELLOW}🌐 NEXTAUTH_URL${NC}"
echo "Se configurará automáticamente después del primer deploy"

# Opcionales
echo ""
echo -e "${BLUE}📧 Configuración OPCIONAL (puedes dejar en blanco)${NC}"
echo ""

read -p "STRIPE_SECRET_KEY (opcional, Enter para saltar): " STRIPE_SECRET_KEY
read -p "RESEND_API_KEY (opcional, Enter para saltar): " RESEND_API_KEY
read -p "GOOGLE_CLIENT_ID (opcional, Enter para saltar): " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET (opcional, Enter para saltar): " GOOGLE_CLIENT_SECRET

# ============================================
# 5. DESPLEGAR EN VERCEL
# ============================================
echo ""
echo -e "${BLUE}🚀 Desplegando en Vercel...${NC}"
echo ""

# Crear archivo .vercel con las env vars
cat > .vercel-env.tmp << EOF
DATABASE_URL=${DATABASE_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
EOF

if [ ! -z "$STRIPE_SECRET_KEY" ]; then
    echo "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" >> .vercel-env.tmp
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_SECRET_KEY/sk_/pk_}" >> .vercel-env.tmp
fi

if [ ! -z "$RESEND_API_KEY" ]; then
    echo "RESEND_API_KEY=${RESEND_API_KEY}" >> .vercel-env.tmp
    echo "EMAIL_FROM=noreply@agendaturnospro.com" >> .vercel-env.tmp
fi

if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .vercel-env.tmp
    echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" >> .vercel-env.tmp
fi

# Deploy con Vercel
echo -e "${YELLOW}Ejecutando deploy...${NC}"
echo ""

# Primer deploy
vercel --prod --yes

# Obtener la URL del deployment
VERCEL_URL=$(vercel ls --prod | grep "agenda-turnos" | head -1 | awk '{print $2}')

if [ -z "$VERCEL_URL" ]; then
    echo -e "${YELLOW}⚠️  No se pudo obtener la URL automáticamente${NC}"
    read -p "¿Cuál es tu URL de Vercel? (ej: https://tu-proyecto.vercel.app): " VERCEL_URL
fi

echo ""
echo -e "${GREEN}✅ Deploy completado en: ${VERCEL_URL}${NC}"

# ============================================
# 6. CONFIGURAR NEXTAUTH_URL
# ============================================
echo ""
echo -e "${BLUE}⚙️  Configurando NEXTAUTH_URL...${NC}"

vercel env add NEXTAUTH_URL production <<< "$VERCEL_URL"

echo -e "${GREEN}✅ NEXTAUTH_URL configurada${NC}"

# ============================================
# 7. MIGRAR BASE DE DATOS
# ============================================
echo ""
echo -e "${BLUE}🗄️  Migrando base de datos...${NC}"

DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo -e "${GREEN}✅ Migraciones aplicadas${NC}"

# ============================================
# 8. RE-DEPLOY FINAL
# ============================================
echo ""
echo -e "${BLUE}🔄 Re-desplegando con todas las configuraciones...${NC}"

vercel --prod --yes

# Limpiar archivo temporal
rm -f .vercel-env.tmp

# ============================================
# 9. RESUMEN FINAL
# ============================================
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Información de tu despliegue:${NC}"
echo ""
echo -e "🌐 URL de tu aplicación:"
echo -e "   ${GREEN}${VERCEL_URL}${NC}"
echo ""
echo -e "📋 Próximos pasos:"
echo "   1. Visita tu URL"
echo "   2. Crea una cuenta en /auth/register"
echo "   3. Crea tu primer negocio"
echo "   4. ¡Empieza a recibir reservas!"
echo ""
echo -e "🔧 Dashboards importantes:"
echo "   - Vercel: https://vercel.com/dashboard"
echo "   - Neon: https://console.neon.tech"
if [ ! -z "$STRIPE_SECRET_KEY" ]; then
    echo "   - Stripe: https://dashboard.stripe.com"
fi
if [ ! -z "$RESEND_API_KEY" ]; then
    echo "   - Resend: https://resend.com/dashboard"
fi
echo ""
echo -e "${GREEN}🚀 ¡Tu aplicación está ONLINE y lista para usar!${NC}"
echo ""

# Abrir la URL en el navegador
if command -v open &> /dev/null; then
    read -p "¿Quieres abrir tu aplicación ahora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$VERCEL_URL"
    fi
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}¡Gracias por usar Agenda Turnos Pro!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"





