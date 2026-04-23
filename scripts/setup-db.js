#!/usr/bin/env node
/**
 * Script para configurar la base de datos sin Docker.
 * Usa Neon (gratis) - https://neon.tech
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env');

console.log('\n📋 Configuración de base de datos\n');
console.log('Sin Docker, necesitás una base PostgreSQL en la nube.');
console.log('Neon es gratis: https://neon.tech\n');

// Intentar abrir el navegador
try {
  const open = require('os').platform() === 'darwin' ? 'open' : 'start';
  execSync(`${open} https://neon.tech`, { stdio: 'ignore' });
  console.log('Abriendo neon.tech en el navegador...\n');
} catch (_) {}

console.log('Pasos:');
console.log('1. Creá una cuenta en Neon (gratis)');
console.log('2. Creá un nuevo proyecto');
console.log('3. Copiá la connection string (Connection string)');
console.log('4. Pegá la URL aquí (debe empezar con postgresql://)\n');

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Si ya viene en env, usarlo
let urlFromEnv = process.env.DATABASE_URL || '';

rl.question('DATABASE_URL (o Enter si ya está en .env): ', (urlInput) => {
  rl.close();

  let url = (urlInput || urlFromEnv || '').trim();
  if (!url) {
    console.log('\nUsando DATABASE_URL de .env...');
    runDbPush();
    return;
  }

  if (!url.startsWith('postgresql://')) {
    console.log('\n❌ La URL debe empezar con postgresql://');
    process.exit(1);
  }

  // Agregar ?sslmode=require si no está
  if (!url.includes('?')) {
    url += '?sslmode=require';
  } else if (!url.includes('sslmode')) {
    url += '&sslmode=require';
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL="${url}"`
    );
  } else {
    envContent = `DATABASE_URL="${url}"\n` + envContent;
  }
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env actualizado');
  runDbPush();
});

function runDbPush() {
  console.log('\nCreando tablas...');
  try {
    execSync('npx prisma db push', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log('\n✅ Base de datos lista. Ejecutá: npm run db:seed (opcional)');
  } catch (e) {
    console.log('\n❌ Error. ¿Tenés PostgreSQL corriendo?');
    console.log('   - Con Docker: npm run docker:up');
    console.log('   - Sin Docker: usá Neon (neon.tech) y pegá la URL');
    process.exit(1);
  }
}
