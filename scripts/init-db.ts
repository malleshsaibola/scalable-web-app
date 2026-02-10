/**
 * Database initialization script
 * Run this script to create the database and tables
 * 
 * Usage: npx tsx scripts/init-db.ts
 */

import { initializeDatabase } from '../lib/db';

console.log('Initializing database...');

try {
  initializeDatabase();
  console.log('✓ Database initialization complete!');
  process.exit(0);
} catch (error) {
  console.error('✗ Database initialization failed:', error);
  process.exit(1);
}
