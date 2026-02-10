/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requirements: 4.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db-helpers';
import { createSessionData } from '@/lib/auth';
import { authMiddleware, createErrorResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return authResult.response;
    }

    const { userId } = authResult.user;

    // Get user from database
    const user = findUserById(userId);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Return safe user data (excluding password)
    return NextResponse.json({
      user: createSessionData(user),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return createErrorResponse('An error occurred', 500);
  }
}
