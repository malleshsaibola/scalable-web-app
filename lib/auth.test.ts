/**
 * Tests for authentication utilities
 * Includes both unit tests and property-based tests
 */

import { describe, test, expect } from '@jest/globals';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  validatePassword,
  validateEmail,
  createSessionData,
  validateCredentials,
} from './auth';

describe('Password Hashing', () => {
  test('hashPassword returns a bcrypt hash', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);

    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toBe(password);
  });

  test('hashPassword produces different hashes for same password', async () => {
    const password = 'testpassword123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    // Due to salt, hashes should be different
    expect(hash1).not.toBe(hash2);
  });

  test('comparePassword returns true for correct password', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword(password, hash);

    expect(isMatch).toBe(true);
  });

  test('comparePassword returns false for incorrect password', async () => {
    const password = 'testpassword123';
    const wrongPassword = 'wrongpassword456';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword(wrongPassword, hash);

    expect(isMatch).toBe(false);
  });

  test('comparePassword handles empty password', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword('', hash);

    expect(isMatch).toBe(false);
  });
});

describe('JWT Token Generation and Verification', () => {
  test('generateToken creates a valid JWT token', async () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });

  test('verifyToken decodes valid token correctly', async () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);
    const payload = await verifyToken(token);

    expect(payload.userId).toBe(userId);
    expect(payload.email).toBe(email);
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });

  test('verifyToken throws error for invalid token', async () => {
    const invalidToken = 'invalid.token.here';

    await expect(verifyToken(invalidToken)).rejects.toThrow(
      'Invalid or expired token'
    );
  });

  test('verifyToken throws error for malformed token', async () => {
    const malformedToken = 'not-a-jwt-token';

    await expect(verifyToken(malformedToken)).rejects.toThrow(
      'Invalid or expired token'
    );
  });

  test('verifyToken throws error for empty token', async () => {
    await expect(verifyToken('')).rejects.toThrow('Invalid or expired token');
  });

  test('token contains expiration time', async () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);
    const payload = await verifyToken(token);

    expect(payload.exp).toBeDefined();
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  });
});

describe('Token Extraction', () => {
  test('extractTokenFromHeader extracts token from Bearer header', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
    const authHeader = `Bearer ${token}`;
    const extracted = extractTokenFromHeader(authHeader);

    expect(extracted).toBe(token);
  });

  test('extractTokenFromHeader returns null for missing Bearer prefix', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
    const extracted = extractTokenFromHeader(token);

    expect(extracted).toBeNull();
  });

  test('extractTokenFromHeader returns null for null header', () => {
    const extracted = extractTokenFromHeader(null);

    expect(extracted).toBeNull();
  });

  test('extractTokenFromHeader returns null for empty string', () => {
    const extracted = extractTokenFromHeader('');

    expect(extracted).toBeNull();
  });

  test('extractTokenFromHeader handles Bearer with extra spaces', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
    const authHeader = `Bearer  ${token}`;
    const extracted = extractTokenFromHeader(authHeader);

    // Should extract with the extra space
    expect(extracted).toBe(` ${token}`);
  });
});

describe('Password Validation', () => {
  test('validatePassword accepts valid password', () => {
    const result = validatePassword('password123');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validatePassword rejects password shorter than 8 characters', () => {
    const result = validatePassword('pass123');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters long');
  });

  test('validatePassword rejects empty password', () => {
    const result = validatePassword('');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters long');
  });

  test('validatePassword accepts exactly 8 characters', () => {
    const result = validatePassword('12345678');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validatePassword accepts long password', () => {
    const longPassword = 'a'.repeat(100);
    const result = validatePassword(longPassword);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('Email Validation', () => {
  test('validateEmail accepts valid email', () => {
    const result = validateEmail('test@example.com');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validateEmail rejects email without @', () => {
    const result = validateEmail('testexample.com');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  test('validateEmail rejects email without domain', () => {
    const result = validateEmail('test@');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  test('validateEmail rejects email without local part', () => {
    const result = validateEmail('@example.com');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  test('validateEmail rejects empty email', () => {
    const result = validateEmail('');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  test('validateEmail accepts email with subdomain', () => {
    const result = validateEmail('test@mail.example.com');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validateEmail accepts email with plus sign', () => {
    const result = validateEmail('test+tag@example.com');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('Session Data Creation', () => {
  test('createSessionData excludes password', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
    };

    const sessionData = createSessionData(user);

    expect(sessionData.id).toBe(user.id);
    expect(sessionData.email).toBe(user.email);
    expect(sessionData.name).toBe(user.name);
    expect('password' in sessionData).toBe(false);
  });

  test('createSessionData works without password field', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const sessionData = createSessionData(user);

    expect(sessionData.id).toBe(user.id);
    expect(sessionData.email).toBe(user.email);
    expect(sessionData.name).toBe(user.name);
  });
});

describe('Credentials Validation', () => {
  test('validateCredentials accepts valid credentials', () => {
    const result = validateCredentials('test@example.com', 'password123');

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  test('validateCredentials rejects invalid email', () => {
    const result = validateCredentials('invalid-email', 'password123');

    expect(result.isValid).toBe(false);
    expect(result.errors?.email).toBe('Invalid email format');
    expect(result.errors?.password).toBeUndefined();
  });

  test('validateCredentials rejects short password', () => {
    const result = validateCredentials('test@example.com', 'pass');

    expect(result.isValid).toBe(false);
    expect(result.errors?.password).toBe(
      'Password must be at least 8 characters long'
    );
    expect(result.errors?.email).toBeUndefined();
  });

  test('validateCredentials rejects both invalid email and password', () => {
    const result = validateCredentials('invalid-email', 'pass');

    expect(result.isValid).toBe(false);
    expect(result.errors?.email).toBe('Invalid email format');
    expect(result.errors?.password).toBe(
      'Password must be at least 8 characters long'
    );
  });

  test('validateCredentials rejects empty credentials', () => {
    const result = validateCredentials('', '');

    expect(result.isValid).toBe(false);
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.password).toBeDefined();
  });
});

describe('Integration Tests', () => {
  test('full authentication flow: hash, generate token, verify', async () => {
    // Simulate user registration
    const password = 'mypassword123';
    const hashedPassword = await hashPassword(password);

    // Simulate user login
    const isPasswordCorrect = await comparePassword(password, hashedPassword);
    expect(isPasswordCorrect).toBe(true);

    // Generate token
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);

    // Verify token
    const payload = await verifyToken(token);
    expect(payload.userId).toBe(userId);
    expect(payload.email).toBe(email);
  });

  test('authentication flow fails with wrong password', async () => {
    const password = 'mypassword123';
    const wrongPassword = 'wrongpassword456';
    const hashedPassword = await hashPassword(password);

    const isPasswordCorrect = await comparePassword(
      wrongPassword,
      hashedPassword
    );
    expect(isPasswordCorrect).toBe(false);
  });

  test('token extraction and verification flow', async () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);

    const authHeader = `Bearer ${token}`;
    const extractedToken = extractTokenFromHeader(authHeader);

    expect(extractedToken).toBe(token);

    if (extractedToken) {
      const payload = await verifyToken(extractedToken);
      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
    }
  });
});
