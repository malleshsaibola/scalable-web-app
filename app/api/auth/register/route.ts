/**
 * POST /api/auth/register
 * Register a new user
 * Requirements: 1.1, 1.2, 1.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db-helpers';
import {
  hashPassword,
  generateToken,
  validateCredentials,
  createSessionData,
} from '@/lib/auth';
import { createErrorResponse, validateRequestBody } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validation = validateRequestBody(body, ['name', 'email', 'password']);
    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, validation.errors);
    }

    const { email, password, name } = body;

    // Validate credentials format
    const credentialsValidation = validateCredentials(email, password);
    if (!credentialsValidation.isValid) {
      return createErrorResponse(
        'Validation failed',
        400,
        credentialsValidation.errors as Record<string, string[]>
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return createErrorResponse('Email already registered', 400, {
        email: ['This email is already registered'],
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = createUser({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT token
    const token = await generateToken(user.id, user.email);

    // Return token and safe user data
    return NextResponse.json(
      {
        token,
        user: createSessionData(user),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse(
      'An error occurred during registration',
      500
    );
  }
}
