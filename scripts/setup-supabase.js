#!/usr/bin/env node

/**
 * Luma E-Commerce - Supabase Setup Script
 * 
 * This script helps you set up the complete Supabase database schema
 * by reading the SQL migration file and providing instructions.
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function header(text) {
  console.log('');
  log(`╔${'═'.repeat(text.length + 2)}╗`, 'cyan');
  log(`║ ${text} ║`, 'cyan');
  log(`╚${'═'.repeat(text.length + 2)}╝`, 'cyan');
  console.log('');
}

function main() {
  header('Luma E-Commerce - Supabase Database Setup');

  log('This script will help you set up the complete Luma database schema.', 'bright');
  console.log('');

  // Check if migration file exists
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_full_schema.sql');
  
  if (!fs.existsSync(migrationPath)) {
    log('❌ Error: Migration file not found at:', 'red');
    log(`   ${migrationPath}`, 'red');
    process.exit(1);
  }

  const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
  const lineCount = migrationContent.split('\n').length;
  const tableCount = (migrationContent.match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
  const indexCount = (migrationContent.match(/CREATE INDEX IF NOT EXISTS/g) || []).length;

  log('✅ Migration file found:', 'green');
  log(`   File: supabase/migrations/001_full_schema.sql`, 'green');
  log(`   Lines: ${lineCount}`, 'green');
  log(`   Tables: ${tableCount}`, 'green');
  log(`   Indexes: ${indexCount}`, 'green');
  console.log('');

  log('📋 Database Schema Summary:', 'bright');
  console.log('');
  
  const sections = [
    { name: 'System Tables', count: 2 },
    { name: 'Catalog Tables', count: 5 },
    { name: 'Shopping Tables', count: 3 },
    { name: 'Order Tables', count: 4 },
    { name: 'Payment Tables', count: 2 },
    { name: 'Community Tables', count: 2 },
    { name: 'CMS Tables', count: 4 },
  ];

  sections.forEach(section => {
    log(`  • ${section.name}: ${section.count} tables`, 'blue');
  });

  console.log('');
  log('🚀 Setup Instructions:', 'bright');
  console.log('');

  log('Step 1: Get Supabase Credentials', 'yellow');
  log('  1. Go to: https://supabase.com/dashboard', 'blue');
  log('  2. Select your project', 'blue');
  log('  3. Go to Settings → API', 'blue');
  log('  4. Copy "Project URL" and "Anon public key"', 'blue');
  console.log('');

  log('Step 2: Add Environment Variables', 'yellow');
  log('  1. In v0, click Settings (gear icon)', 'blue');
  log('  2. Go to "Vars" tab', 'blue');
  log('  3. Add two variables:', 'blue');
  log('     - VITE_SUPABASE_URL = <Your Project URL>', 'blue');
  log('     - VITE_SUPABASE_PUBLISHABLE_KEY = <Your Anon Key>', 'blue');
  console.log('');

  log('Step 3: Run the Migration', 'yellow');
  log('  1. Go to your Supabase project dashboard', 'blue');
  log('  2. Click "SQL Editor" in the left sidebar', 'blue');
  log('  3. Click "New query"', 'blue');
  log('  4. Copy the entire content from:', 'blue');
  log('     supabase/migrations/001_full_schema.sql', 'blue');
  log('  5. Paste into the SQL Editor', 'blue');
  log('  6. Click the "Run" button', 'blue');
  log('  7. Wait for completion ✅', 'blue');
  console.log('');

  log('Step 4: Verify Installation', 'yellow');
  log('  1. Go to "Table Editor" in Supabase', 'blue');
  log('  2. Verify all 22 tables are present', 'blue');
  log('  3. Check that sample categories were seeded', 'blue');
  console.log('');

  log('📋 Features Created:', 'bright');
  console.log('');
  
  const features = [
    '✅ 22 Database Tables',
    '✅ 11 Automatic Triggers',
    '✅ 12 Performance Indexes',
    '✅ 13 Row Level Security Policies',
    '✅ Bilingual Content (Arabic/English)',
    '✅ User Authentication Integration',
    '✅ Inventory Management',
    '✅ Order Processing',
    '✅ Coupon System',
    '✅ Review & Rating System',
    '✅ Admin Activity Logging',
    '✅ CMS Configuration',
  ];

  features.forEach(feature => {
    log(`  ${feature}`, 'green');
  });

  console.log('');
  log('💡 Need Help?', 'bright');
  console.log('');
  log('  • Setup Guide: See SUPABASE_SETUP.md', 'blue');
  log('  • Schema Docs: See DATABASE_SCHEMA.md', 'blue');
  log('  • Supabase Docs: https://supabase.com/docs', 'blue');
  console.log('');

  log('Ready to set up? Follow the steps above!', 'green');
  console.log('');
}

main();
