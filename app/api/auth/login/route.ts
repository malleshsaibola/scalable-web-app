/**
 * POST /api/auth/login
 * Login user
 * Requirements: 1.2, 2.1, 2.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db-helpers';
import {
  comparePassword,
  generateToken,
  validateCredentials,
  createSessionData,
} from '@/lib/auth';
import { createErrorResponse, validateRequestBody } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validation = validateRequestBody(body, ['email', 'password']);
    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, validation.errors);
    }

    const { email, password } = body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      // Generic error to prevent user enumeration
      return createErrorResponse('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Generic error to prevent user enumeration
      return createErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = await generateToken(user.id, user.email);

    // Return token and safe user data
    return NextResponse.json({
      token,
      user: createSessionData(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('An error occurred during login', 500);
  }
}
