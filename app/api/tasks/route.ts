/**
 * Task API Routes
 * GET /api/tasks - Get all user tasks
 * POST /api/tasks - Create new task
 * Requirements: 5.1, 5.2
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createTask,
  findTasksByUserId,
} from '@/lib/db-helpers';
import { authMiddleware, createErrorResponse, validateRequestBody } from '@/lib/middleware';

/**
 * GET /api/tasks
 * Get all tasks for authenticated user
 * Requirement 5.2: Return all entities owned by user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return authResult.response;
    }

    const { userId } = authResult.user;

    // Get search query parameter
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get all user tasks
    let tasks = findTasksByUserId(userId);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return createErrorResponse('An error occurred while fetching tasks', 500);
  }
}

/**
 * POST /api/tasks
 * Create a new task
 * Requirement 5.1: Persist entity associated with user's account
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return authResult.response;
    }

    const { userId } = authResult.user;

    const body = await request.json();

    // Validate required fields
    const validation = validateRequestBody(body, ['title']);
    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, validation.errors);
    }

    const { title, description, status } = body;

    // Validate status if provided
    if (status && !['active', 'completed', 'archived'].includes(status)) {
      return createErrorResponse('Invalid status value', 400, {
        status: ['Status must be one of: active, completed, archived'],
      });
    }

    // Create task
    const task = createTask({
      userId,
      title,
      description,
      status: status || 'active',
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return createErrorResponse('An error occurred while creating task', 500);
  }
}
