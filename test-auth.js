/**
 * Test script for auth utilities
 * Run with: node test-auth.js
 */

const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePassword,
  validateEmail,
  validateCredentials,
  createSessionData,
  extractTokenFromHeader,
} = require('./lib/auth.ts');

console.log('🧪 Testing Authentication Utilities\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.log(`❌ ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  try {
    // ============================================================================
    // Password Hashing Tests
    // ============================================================================

    console.log('🔐 Testing Password Hashing\n');

    const password = 'testpassword123';
    const hash = await hashPassword(password);
    assert(hash && hash.startsWith('$2'), 'hashPassword: Creates bcrypt hash');
    assert(hash !== password, 'hashPassword: Hash differs from password');

    const hash2 = await hashPassword(password);
    assert(hash !== hash2, 'hashPassword: Different salts produce different hashes');

    const isMatch = await comparePassword(password, hash);
    assert(isMatch === true, 'comparePassword: Correct password matches');

    const isWrong = await comparePassword('wrongpassword', hash);
    assert(isWrong === false, 'comparePassword: Wrong password does not match');

    const isEmpty = await comparePassword('', hash);
    assert(isEmpty === false, 'comparePassword: Empty password does not match');

    // ============================================================================
    // JWT Token Tests
    // ============================================================================

    console.log('\n🎫 Testing JWT Tokens\n');

    const userId = 'user123';
    const email = 'test@example.com';
    const token = await generateToken(userId, email);
    assert(token && typeof token === 'string', 'generateToken: Creates token string');
    assert(token.split('.').length === 3, 'generateToken: Token has 3 parts (JWT format)');

    const payload = await verifyToken(token);
    assert(payload.userId === userId, 'verifyToken: Decodes userId correctly');
    assert(payload.email === email, 'verifyToken: Decodes email correctly');
    assert(payload.iat !== undefined, 'verifyToken: Token has issued-at timestamp');
    assert(payload.exp !== undefined, 'verifyToken: Token has expiration timestamp');

    try {
      await verifyToken('invalid.token.here');
      assert(false, 'verifyToken: Should throw for invalid token');
    } catch (error) {
      assert(error.message === 'Invalid or expired token', 'verifyToken: Throws for invalid token');
    }

    try {
      await verifyToken('');
      assert(false, 'verifyToken: Should throw for empty token');
    } catch (error) {
      assert(error.message === 'Invalid or expired token', 'verifyToken: Throws for empty token');
    }

    // ============================================================================
    // Token Extraction Tests
    // ============================================================================

    console.log('\n🔍 Testing Token Extraction\n');

    const authHeader = `Bearer ${token}`;
    const extracted = extractTokenFromHeader(authHeader);
    assert(extracted === token, 'extractTokenFromHeader: Extracts token from Bearer header');

    const noBearer = extractTokenFromHeader(token);
    assert(noBearer === null, 'extractTokenFromHeader: Returns null without Bearer prefix');

    const nullHeader = extractTokenFromHeader(null);
    assert(nullHeader === null, 'extractTokenFromHeader: Returns null for null header');

    const emptyHeader = extractTokenFromHeader('');
    assert(emptyHeader === null, 'extractTokenFromHeader: Returns null for empty header');

    // ============================================================================
    // Validation Tests
    // ============================================================================

    console.log('\n✔️  Testing Validation Functions\n');

    // Password validation
    const validPass = validatePassword('password123');
    assert(validPass.isValid === true, 'validatePassword: Accepts valid password');
    assert(validPass.error === undefined, 'validatePassword: No error for valid password');

    const shortPass = validatePassword('short');
    assert(shortPass.isValid === false, 'validatePassword: Rejects short password');
    assert(shortPass.error === 'Password must be at least 8 characters long', 'validatePassword: Correct error message');

    const emptyPass = validatePassword('');
    assert(emptyPass.isValid === false, 'validatePassword: Rejects empty password');

    const exactPass = validatePassword('12345678');
    assert(exactPass.isValid === true, 'validatePassword: Accepts exactly 8 characters');

    // Email validation
    const validEmail = validateEmail('test@example.com');
    assert(validEmail.isValid === true, 'validateEmail: Accepts valid email');
    assert(validEmail.error === undefined, 'validateEmail: No error for valid email');

    const noAt = validateEmail('testexample.com');
    assert(noAt.isValid === false, 'validateEmail: Rejects email without @');
    assert(noAt.error === 'Invalid email format', 'validateEmail: Correct error message');

    const noDomain = validateEmail('test@');
    assert(noDomain.isValid === false, 'validateEmail: Rejects email without domain');

    const noLocal = validateEmail('@example.com');
    assert(noLocal.isValid === false, 'validateEmail: Rejects email without local part');

    const emptyEmail = validateEmail('');
    assert(emptyEmail.isValid === false, 'validateEmail: Rejects empty email');

    const subdomain = validateEmail('test@mail.example.com');
    assert(subdomain.isValid === true, 'validateEmail: Accepts email with subdomain');

    // Credentials validation
    const validCreds = validateCredentials('test@example.com', 'password123');
    assert(validCreds.isValid === true, 'validateCredentials: Accepts valid credentials');
    assert(validCreds.errors === undefined, 'validateCredentials: No errors for valid credentials');

    const invalidEmailCreds = validateCredentials('invalid-email', 'password123');
    assert(invalidEmailCreds.isValid === false, 'validateCredentials: Rejects invalid email');
    assert(invalidEmailCreds.errors.email === 'Invalid email format', 'validateCredentials: Email error message');
    assert(invalidEmailCreds.errors.password === undefined, 'validateCredentials: No password error');

    const invalidPassCreds = validateCredentials('test@example.com', 'short');
    assert(invalidPassCreds.isValid === false, 'validateCredentials: Rejects short password');
    assert(invalidPassCreds.errors.password === 'Password must be at least 8 characters long', 'validateCredentials: Password error message');
    assert(invalidPassCreds.errors.email === undefined, 'validateCredentials: No email error');

    const bothInvalid = validateCredentials('invalid-email', 'short');
    assert(bothInvalid.isValid === false, 'validateCredentials: Rejects both invalid');
    assert(bothInvalid.errors.email !== undefined, 'validateCredentials: Has email error');
    assert(bothInvalid.errors.password !== undefined, 'validateCredentials: Has password error');

    // ============================================================================
    // Session Data Tests
    // ============================================================================

    console.log('\n👤 Testing Session Data\n');

    const user = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
    };

    const sessionData = createSessionData(user);
    assert(sessionData.id === user.id, 'createSessionData: Includes user ID');
    assert(sessionData.email === user.email, 'createSessionData: Includes email');
    assert(sessionData.name === user.name, 'createSessionData: Includes name');
    assert(!('password' in sessionData), 'createSessionData: Excludes password');

    const userNoPass = {
      id: 'user456',
      email: 'test2@example.com',
      name: 'Test User 2',
    };

    const sessionData2 = createSessionData(userNoPass);
    assert(sessionData2.id === userNoPass.id, 'createSessionData: Works without password field');

    // ============================================================================
    // Integration Tests
    // ============================================================================

    console.log('\n🔄 Testing Integration Flows\n');

    // Full auth flow
    const regPassword = 'mypassword123';
    const regHash = await hashPassword(regPassword);
    const loginMatch = await comparePassword(regPassword, regHash);
    assert(loginMatch === true, 'Integration: Password hash and compare flow');

    const regUserId = 'user789';
    const regEmail = 'integration@example.com';
    const regToken = await generateToken(regUserId, regEmail);
    const regPayload = await verifyToken(regToken);
    assert(regPayload.userId === regUserId && regPayload.email === regEmail, 'Integration: Token generation and verification flow');

    // Token extraction and verification
    const authFlow = `Bearer ${regToken}`;
    const extractedToken = extractTokenFromHeader(authFlow);
    if (extractedToken) {
      const verifiedPayload = await verifyToken(extractedToken);
      assert(verifiedPayload.userId === regUserId, 'Integration: Full token extraction and verification flow');
    }

    // ============================================================================
    // Summary
    // ============================================================================

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Test Summary:`);
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log(`   📈 Total:  ${testsPassed + testsFailed}`);

    if (testsFailed === 0) {
      console.log('\n🎉 All tests passed!\n');
    } else {
      console.log('\n⚠️  Some tests failed!\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
