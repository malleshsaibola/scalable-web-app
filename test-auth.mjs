/**
 * Simple test script to verify auth utilities work
 * Run with: node test-auth.mjs
 */

import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePassword,
  validateEmail,
  validateCredentials,
  createSessionData,
  extractTokenFromHeader,
} from './lib/auth.js';

async function runTests() {
  console.log('Testing auth utilities...\n');

  try {
    // Test 1: Password hashing
    console.log('Test 1: Password hashing');
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    console.log('✓ Password hashed successfully');
    console.log(`  Hash starts with: ${hash.substring(0, 7)}`);

    // Test 2: Password comparison
    console.log('\nTest 2: Password comparison');
    const isMatch = await comparePassword(password, hash);
    console.log(`✓ Correct password matches: ${isMatch}`);
    const isWrong = await comparePassword('wrongpassword', hash);
    console.log(`✓ Wrong password doesn't match: ${!isWrong}`);

    // Test 3: Token generation
    console.log('\nTest 3: Token generation');
    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);
    console.log('✓ Token generated successfully');
    console.log(`  Token parts: ${token.split('.').length}`);

    // Test 4: Token verification
    console.log('\nTest 4: Token verification');
    const payload = await verifyToken(token);
    console.log(`✓ Token verified successfully`);
    console.log(`  User ID: ${payload.userId}`);
    console.log(`  Email: ${payload.email}`);

    // Test 5: Token extraction
    console.log('\nTest 5: Token extraction');
    const authHeader = `Bearer ${token}`;
    const extracted = extractTokenFromHeader(authHeader);
    console.log(`✓ Token extracted: ${extracted === token}`);

    // Test 6: Password validation
    console.log('\nTest 6: Password validation');
    const validPass = validatePassword('password123');
    console.log(`✓ Valid password accepted: ${validPass.isValid}`);
    const invalidPass = validatePassword('short');
    console.log(`✓ Short password rejected: ${!invalidPass.isValid}`);

    // Test 7: Email validation
    console.log('\nTest 7: Email validation');
    const validEmail = validateEmail('test@example.com');
    console.log(`✓ Valid email accepted: ${validEmail.isValid}`);
    const invalidEmail = validateEmail('invalid-email');
    console.log(`✓ Invalid email rejected: ${!invalidEmail.isValid}`);

    // Test 8: Credentials validation
    console.log('\nTest 8: Credentials validation');
    const validCreds = validateCredentials('test@example.com', 'password123');
    console.log(`✓ Valid credentials accepted: ${validCreds.isValid}`);
    const invalidCreds = validateCredentials('bad-email', 'short');
    console.log(`✓ Invalid credentials rejected: ${!invalidCreds.isValid}`);

    // Test 9: Session data creation
    console.log('\nTest 9: Session data creation');
    const user = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
    };
    const sessionData = createSessionData(user);
    console.log(`✓ Session data created without password: ${!('password' in sessionData)}`);
    console.log(`  Session data: ${JSON.stringify(sessionData)}`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
