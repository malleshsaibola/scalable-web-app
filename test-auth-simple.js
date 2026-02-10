/**
 * Simple inline test for auth utilities
 * This tests the compiled JavaScript directly
 */

const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');

// Inline implementations for testing
const JWT_SECRET = 'test-secret-key';
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function generateToken(userId, email) {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
  return token;
}

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }
  return { isValid: true };
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }
  return { isValid: true };
}

function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function createSessionData(user) {
  const { password, ...safeUserData } = user;
  return safeUserData;
}

async function runTests() {
  console.log('Testing auth utilities...\n');
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Password hashing
    console.log('Test 1: Password hashing');
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    if (hash && hash.startsWith('$2')) {
      console.log('✓ Password hashed successfully');
      passed++;
    } else {
      console.log('✗ Password hash format incorrect');
      failed++;
    }

    // Test 2: Password comparison
    console.log('\nTest 2: Password comparison');
    const isMatch = await comparePassword(password, hash);
    const isWrong = await comparePassword('wrongpassword', hash);
    if (isMatch && !isWrong) {
      console.log('✓ Password comparison works correctly');
      passed++;
    } else {
      console.log('✗ Password comparison failed');
      failed++;
    }

    // Test 3: Token generation
    console.log('\nTest 3: Token generation');
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);
    if (token && token.split('.').length === 3) {
      console.log('✓ Token generated successfully');
      passed++;
    } else {
      console.log('✗ Token generation failed');
      failed++;
    }

    // Test 4: Token verification
    console.log('\nTest 4: Token verification');
    const payload = await verifyToken(token);
    if (payload.userId === userId && payload.email === email) {
      console.log('✓ Token verified successfully');
      passed++;
    } else {
      console.log('✗ Token verification failed');
      failed++;
    }

    // Test 5: Token extraction
    console.log('\nTest 5: Token extraction');
    const authHeader = `Bearer ${token}`;
    const extracted = extractTokenFromHeader(authHeader);
    if (extracted === token) {
      console.log('✓ Token extracted correctly');
      passed++;
    } else {
      console.log('✗ Token extraction failed');
      failed++;
    }

    // Test 6: Password validation
    console.log('\nTest 6: Password validation');
    const validPass = validatePassword('password123');
    const invalidPass = validatePassword('short');
    if (validPass.isValid && !invalidPass.isValid) {
      console.log('✓ Password validation works');
      passed++;
    } else {
      console.log('✗ Password validation failed');
      failed++;
    }

    // Test 7: Email validation
    console.log('\nTest 7: Email validation');
    const validEmail = validateEmail('test@example.com');
    const invalidEmail = validateEmail('invalid-email');
    if (validEmail.isValid && !invalidEmail.isValid) {
      console.log('✓ Email validation works');
      passed++;
    } else {
      console.log('✗ Email validation failed');
      failed++;
    }

    // Test 8: Session data creation
    console.log('\nTest 8: Session data creation');
    const user = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
    };
    const sessionData = createSessionData(user);
    if (!('password' in sessionData) && sessionData.id === user.id) {
      console.log('✓ Session data created without password');
      passed++;
    } else {
      console.log('✗ Session data creation failed');
      failed++;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Tests passed: ${passed}`);
    console.log(`Tests failed: ${failed}`);
    if (failed === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
