import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

// Database file path
const DB_PATH = path.join(process.cwd(), 'app.db.json');

interface Database {
  users: any[];
  tasks: any[];
}

let db: Database | null = null;

/**
 * Get or create database
 */
export function getDb(): Database {
  if (!db) {
    try {
      if (existsSync(DB_PATH)) {
        const data = readFileSync(DB_PATH, 'utf-8');
        db = JSON.parse(data);
      } else {
        db = { users: [], tasks: [] };
        saveDb();
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      throw new Error('Failed to connect to database');
    }
  }
  return db;
}

/**
 * Save database to file
 */
export function saveDb(): void {
  if (db) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save database:', error);
      throw new Error('Failed to save database');
    }
  }
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (db) {
    saveDb();
    db = null;
  }
}

/**
 * Initialize database
 */
export function initializeDatabase(): void {
  getDb();
  console.log('Database initialized at:', DB_PATH);
}
