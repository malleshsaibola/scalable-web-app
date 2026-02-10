import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * API route to initialize the database
 * GET /api/init
 * 
 * This route can be called to ensure the database is initialized
 */
export async function GET() {
  try {
    const db = getDb();
    
    // Verify tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('users', 'tasks')
    `).all();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: tables.map((t: any) => t.name),
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
