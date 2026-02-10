/**
 * Authentication utilities for the scalable web app
 * Provides password hashing, JWT token generation/verification, and session management
 * 
 * Requirements: 8.1, 8.2, 8.3, 2.3
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d'; // 7 days

// Convert secret to Uint8Array for jose library
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

/**
 * Hash a password using bcrypt
 * Requirement 8.1: Passwords must be hashed using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * Requirement 8.3: Password verification must compare against stored hash
 * 
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWT token payload interface
 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 * Requirement 2.3: Backend must validate JWT tokens on protected endpoints
 * 
 * @param userId - User's unique identifier
 * @param email - User's email address
 * @returns Promise resolving to JWT token string
 */
export async function generateToken(
  userId: string,
  email: string
): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getSecretKey());

  return token;
}

/**
 * Verify and decode a JWT token
 * Requirement 2.3: Backend must validate JWT tokens on protected endpoints
 * 
 * @param token - JWT token string to verify
 * @returns Promise resolving to decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    // Validate that payload has required fields
    if (!payload.userId || !payload.email) {
      throw new Error('Invalid token payload');
    }
    return payload as unknown as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 * Helper for middleware to extract Bearer token
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Validate password meets minimum requirements
 * Requirement 8.4: Minimum 8 character password requirement
 * 
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }
  return { isValid: true };
}

/**
 * Validate email format
 * 
 * @param email - Email to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }
  return { isValid: true };
}

/**
 * Session management helper - create session data
 * Returns user data safe for client-side storage (excludes password)
 * 
 * @param user - User object from database
 * @returns Safe user data for session
 */
export function createSessionData(user: {
  id: string;
  email: string;
  name: string;
  password?: string;
}): {
  id: string;
  email: string;
  name: string;
} {
  // Exclude password from session data
  const { password, ...safeUserData } = user;
  return safeUserData;
}

/**
 * Validate authentication credentials
 * Combined validation for registration/login
 * 
 * @param email - Email to validate
 * @param password - Password to validate
 * @returns Object with isValid boolean and errors object if invalid
 */
export function validateCredentials(
  email: string,
  password: string
): {
  isValid: boolean;
  errors?: {
    email?: string;
    password?: string;
  };
} {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  if (!emailValidation.isValid || !passwordValidation.isValid) {
    return {
      isValid: false,
      errors: {
        ...(emailValidation.error && { email: emailValidation.error }),
        ...(passwordValidation.error && { password: passwordValidation.error }),
      },
    };
  }

  return { isValid: true };
}
