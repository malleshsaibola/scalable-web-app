/**
 * Simple test to verify database initialization
 * This can be run with: node --loader tsx lib/db.test.ts
 */

import { getDb, closeDb } from './db';

console.log('Testing database initialization...');

try {
  const db = getDb();
  
  // Test that tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('users', 'tasks')
  `).all();
  
  console.log('Tables found:', tables);
  
  if (tables.length === 2) {
    console.log('✓ Database initialized successfully!');
    console.log('✓ Users table created');
    console.log('✓ Tasks table created');
  } else {
    console.error('✗ Expected 2 tables, found:', tables.length);
  }
  
  closeDb();
} catch (error) {
  console.error('✗ Database test failed:', error);
  process.exit(1);
}
