/**
 * Simple test script to verify database initialization
 * Run with: node test-db.mjs
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'app.db');

console.log('Testing database initialization...');
console.log('Database path:', DB_PATH);

try {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);
  
  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId)
  `);
  
  // Verify tables exist
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
  
  db.close();
} catch (error) {
  console.error('✗ Database test failed:', error);
  process.exit(1);
}
