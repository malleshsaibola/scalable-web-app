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
    
    // For JSON database, just verify it exists and has the expected structure
    const hasUsers = Array.isArray(db.users);
    const hasTasks = Array.isArray(db.tasks);
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: ['users', 'tasks'],
      status: {
        users: hasUsers ? 'ready' : 'missing',
        tasks: hasTasks ? 'ready' : 'missing',
      },
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
