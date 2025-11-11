#!/bin/bash

# ============================================
# Script de Despliegue - Agenda Turnos Pro
# ============================================

set -e

echo "🚀 Iniciando proceso de despliegue..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# ============================================
# 1. Verificar requisitos previos
# ============================================
echo "📋 Verificando requisitos previos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_success "Node.js $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm $(npm --version)"

# Verificar Git
if ! command -v git &> /dev/null; then
    print_error "Git no está instalado"
    exit 1
fi
print_success "Git $(git --version)"

echo ""

# ============================================
# 2. Verificar que estemos en un repositorio Git
# ============================================
echo "🔍 Verificando repositorio Git..."

if [ ! -d .git ]; then
    print_warning "No es un repositorio Git. Inicializando..."
    git init
    git add .
    git commit -m "Initial commit: Agenda Turnos Pro MVP"
    print_success "Repositorio Git inicializado"
else
    print_success "Repositorio Git encontrado"
fi

echo ""

# ============================================
# 3. Limpiar y reinstalar dependencias
# ============================================
echo "📦 Instalando dependencias..."

npm ci --silent
print_success "Dependencias instaladas"

echo ""

# ============================================
# 4. Generar Prisma Client
# ============================================
echo "🗄️  Generando Prisma Client..."

npm run db:generate --silent
print_success "Prisma Client generado"

echo ""

# ============================================
# 5. Verificar TypeScript
# ============================================
echo "🔍 Verificando TypeScript..."

if npm run type-check; then
    print_success "TypeScript OK"
else
    print_error "Errores de TypeScript encontrados"
    echo "Por favor corrige los errores antes de desplegar"
    exit 1
fi

echo ""

# ============================================
# 6. Ejecutar Linter
# ============================================
echo "🧹 Ejecutando Linter..."

if npm run lint; then
    print_success "Linter OK"
else
    print_warning "Advertencias de Linter encontradas"
    read -p "¿Deseas continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# ============================================
# 7. Ejecutar Build Local
# ============================================
echo "🏗️  Ejecutando build local..."

if npm run build; then
    print_success "Build exitoso"
else
    print_error "Build falló"
    exit 1
fi

echo ""

# ============================================
# 8. Verificar Vercel CLI
# ============================================
echo "🔧 Verificando Vercel CLI..."

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI no está instalado"
    read -p "¿Deseas instalarlo ahora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
        print_success "Vercel CLI instalado"
    else
        print_info "Instala Vercel CLI con: npm install -g vercel"
        exit 1
    fi
else
    print_success "Vercel CLI instalado"
fi

echo ""

# ============================================
# 9. Preguntar sobre el entorno
# ============================================
echo "🌍 Selecciona el entorno de despliegue:"
echo "1) Production (main)"
echo "2) Preview (staging)"
read -p "Selecciona (1 o 2): " ENV_CHOICE

if [ "$ENV_CHOICE" == "1" ]; then
    DEPLOY_ENV="production"
    DEPLOY_FLAG="--prod"
else
    DEPLOY_ENV="preview"
    DEPLOY_FLAG=""
fi

echo ""

# ============================================
# 10. Verificar Variables de Entorno
# ============================================
echo "⚙️  Verificando variables de entorno..."

if [ ! -f .env ]; then
    print_warning ".env no encontrado"
    print_info "Asegúrate de configurar las variables en Vercel Dashboard"
else
    print_success ".env encontrado localmente"
fi

echo ""
echo "📋 Variables de entorno REQUERIDAS en Vercel:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - STRIPE_SECRET_KEY"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - RESEND_API_KEY"
echo ""

read -p "¿Has configurado todas las variables en Vercel? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Configura las variables en: https://vercel.com/[tu-proyecto]/settings/environment-variables"
    exit 1
fi

echo ""

# ============================================
# 11. Commit y Push
# ============================================
echo "💾 Preparando código para deploy..."

# Verificar si hay cambios
if [[ -n $(git status -s) ]]; then
    print_info "Hay cambios sin commitear"
    read -p "¿Deseas commitear y pushear ahora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Mensaje del commit: " COMMIT_MSG
        git commit -m "${COMMIT_MSG:-Deploy: Update}"
        
        # Verificar si hay un remote configurado
        if git remote | grep -q 'origin'; then
            git push origin $(git branch --show-current)
            print_success "Código pusheado a GitHub"
        else
            print_warning "No hay remote configurado"
            print_info "Configura tu repositorio en GitHub primero"
        fi
    fi
else
    print_success "No hay cambios pendientes"
fi

echo ""

# ============================================
# 12. Desplegar con Vercel
# ============================================
echo "🚀 Desplegando a Vercel ($DEPLOY_ENV)..."
echo ""

# Login si es necesario
vercel whoami || vercel login

echo ""

# Deploy
print_info "Ejecutando: vercel $DEPLOY_FLAG"
vercel $DEPLOY_FLAG

echo ""

# ============================================
# 13. Post-Deploy
# ============================================
print_success "¡Despliegue completado! 🎉"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica tu aplicación en la URL proporcionada"
echo "   2. Ejecuta migraciones de BD si es necesario:"
echo "      DATABASE_URL='tu-url-produccion' npx prisma migrate deploy"
echo "   3. Configura webhooks de Stripe:"
echo "      https://tu-dominio.com/api/webhooks/stripe"
echo "   4. Prueba el flujo completo de reserva"
echo "   5. Monitorea logs en Vercel Dashboard"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
echo ""

print_success "¡Todo listo! 🚀"

