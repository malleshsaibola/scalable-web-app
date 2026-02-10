/**
 * Task API Routes - Individual Task Operations
 * PUT /api/tasks/[id] - Update task
 * DELETE /api/tasks/[id] - Delete task
 * Requirements: 5.3, 5.4, 5.5
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findTaskById,
  updateTask,
  deleteTask,
  verifyTaskOwnership,
} from '@/lib/db-helpers';
import { authMiddleware, createErrorResponse } from '@/lib/middleware';

/**
 * PUT /api/tasks/[id]
 * Update a task
 * Requirement 5.3: Validate and persist changes for owned entities
 * Requirement 5.5: Verify ownership before allowing updates
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return authResult.response;
    }

    const { userId } = authResult.user;
    const { id } = await params;

    // Check if task exists
    const existingTask = findTaskById(id);
    if (!existingTask) {
      return createErrorResponse('Task not found', 404);
    }

    // Verify ownership
    if (!verifyTaskOwnership(id, userId)) {
      return createErrorResponse('Access denied', 403);
    }

    const body = await request.json();
    const { title, description, status } = body;

    // Validate status if provided
    if (status && !['active', 'completed', 'archived'].includes(status)) {
      return createErrorResponse('Invalid status value', 400, {
        status: ['Status must be one of: active, completed, archived'],
      });
    }

    // Update task
    const updatedTask = updateTask(id, {
      title,
      description,
      status,
    });

    if (!updatedTask) {
      return createErrorResponse('Failed to update task', 500);
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return createErrorResponse('An error occurred while updating task', 500);
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 * Requirement 5.4: Remove entity from database
 * Requirement 5.5: Verify ownership before allowing deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return authResult.response;
    }

    const { userId } = authResult.user;
    const { id } = await params;

    // Check if task exists
    const existingTask = findTaskById(id);
    if (!existingTask) {
      return createErrorResponse('Task not found', 404);
    }

    // Verify ownership
    if (!verifyTaskOwnership(id, userId)) {
      return createErrorResponse('Access denied', 403);
    }

    // Delete task
    const deleted = deleteTask(id);

    if (!deleted) {
      return createErrorResponse('Failed to delete task', 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return createErrorResponse('An error occurred while deleting task', 500);
  }
}
