/**
 * Authentication middleware for Next.js API routes
 * Validates JWT tokens and attaches user information to requests
 * 
 * Requirements: 3.4, 3.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, TokenPayload } from './auth';

/**
 * Extended request type with user information
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user data to request
 * 
 * Usage in API route:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authResult = await authMiddleware(request);
 *   if (authResult.error) {
 *     return authResult.response;
 *   }
 *   const user = authResult.user;
 *   // ... use user data
 * }
 * ```
 * 
 * @param request - Next.js request object
 * @returns Object with user data or error response
 */
export async function authMiddleware(request: NextRequest): Promise<
  | { user: TokenPayload; error: null }
  | { user: null; error: true; response: NextResponse }
> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        user: null,
        error: true,
        response: NextResponse.json(
          {
            error: 'Authentication Error',
            message: 'No authentication token provided',
          },
          { status: 401 }
        ),
      };
    }

    // Verify token
    const user = await verifyToken(token);

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: true,
      response: NextResponse.json(
        {
          error: 'Authentication Error',
          message: 'Invalid or expired token',
        },
        { status: 401 }
      ),
    };
  }
}

/**
 * Helper to create error responses
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      error: getErrorType(status),
      message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Get error type based on status code
 */
function getErrorType(status: number): string {
  switch (status) {
    case 400:
      return 'Validation Error';
    case 401:
      return 'Authentication Error';
    case 403:
      return 'Authorization Error';
    case 404:
      return 'Not Found';
    case 500:
      return 'Server Error';
    default:
      return 'Error';
  }
}

/**
 * Validate request body against required fields
 * 
 * @param body - Request body object
 * @param requiredFields - Array of required field names
 * @returns Object with isValid boolean and errors if invalid
 */
export function validateRequestBody(
  body: Record<string, any>,
  requiredFields: string[]
): {
  isValid: boolean;
  errors?: Record<string, string[]>;
} {
  const errors: Record<string, string[]> = {};
  
  // Field name mapping for better error messages
  const fieldLabels: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    password: 'Password',
    title: 'Title',
    description: 'Description',
  };

  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      const label = fieldLabels[field] || field;
      errors[field] = [`${label} is required`];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true };
}
