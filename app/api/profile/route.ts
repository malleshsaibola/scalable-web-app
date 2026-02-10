/**
 * Profile API Routes
 * GET /api/profile - Get user profile
 * PUT /api/profile - Update user profile
 * Requirements: 4.1, 4.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser, findUserByEmail } from '@/lib/db-helpers';
import { createSessionData, validateEmail } from '@/lib/auth';
import { authMiddleware, createErrorResponse } from '@/lib/middleware';

/**
 * GET /api/profile
 * Get user profile
 * Requirement 4.1: Return user's profile data (excluding password)
 */
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
    console.error('Get profile error:', error);
    return createErrorResponse('An error occurred while fetching profile', 500);
  }
}

/**
 * PUT /api/profile
 * Update user profile
 * Requirement 4.2: Validate and update user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return authResult.response;
    }

    const { userId } = authResult.user;

    const body = await request.json();
    const { name, email } = body;

    // Validate email if provided
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return createErrorResponse('Validation failed', 400, {
          email: [emailValidation.error || 'Invalid email'],
        });
      }

      // Check if email is already taken by another user
      const existingUser = findUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return createErrorResponse('Email already in use', 400, {
          email: ['This email is already registered to another account'],
        });
      }
    }

    // Validate name if provided
    if (name !== undefined && (!name || name.trim() === '')) {
      return createErrorResponse('Validation failed', 400, {
        name: ['Name cannot be empty'],
      });
    }

    // Update user
    const updatedUser = updateUser(userId, {
      name: name?.trim(),
      email,
    });

    if (!updatedUser) {
      return createErrorResponse('Failed to update profile', 500);
    }

    // Return updated safe user data
    return NextResponse.json({
      user: createSessionData(updatedUser),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return createErrorResponse('An error occurred while updating profile', 500);
  }
}
