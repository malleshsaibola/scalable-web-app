# Authentication Utilities

This module provides authentication utilities for the scalable web app, including password hashing, JWT token management, and validation functions.

## Features

### Password Security (Requirements 8.1, 8.2, 8.3)

- **Password Hashing**: Uses bcryptjs with 10 salt rounds
- **Password Comparison**: Secure comparison against stored hashes
- **Minimum Length**: Enforces 8-character minimum password requirement

### JWT Token Management (Requirement 2.3)

- **Token Generation**: Creates JWT tokens with user ID and email
- **Token Verification**: Validates and decodes JWT tokens
- **Token Expiration**: 7-day expiration by default
- **Edge Runtime Compatible**: Uses `jose` library for Next.js Edge runtime

### Validation Functions

- **Email Validation**: Validates email format using regex
- **Password Validation**: Checks minimum length requirements
- **Credentials Validation**: Combined email and password validation

### Session Management

- **Session Data Creation**: Safely creates session data excluding passwords
- **Token Extraction**: Extracts Bearer tokens from Authorization headers

## API Reference

### `hashPassword(password: string): Promise<string>`

Hashes a password using bcrypt.

```typescript
const hash = await hashPassword('mypassword123');
// Returns: $2a$10$...
```

### `comparePassword(password: string, hashedPassword: string): Promise<boolean>`

Compares a plain text password with a hashed password.

```typescript
const isMatch = await comparePassword('mypassword123', hash);
// Returns: true or false
```

### `generateToken(userId: string, email: string): Promise<string>`

Generates a JWT token for a user.

```typescript
const token = await generateToken('user123', 'user@example.com');
// Returns: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### `verifyToken(token: string): Promise<TokenPayload>`

Verifies and decodes a JWT token.

```typescript
const payload = await verifyToken(token);
// Returns: { userId: 'user123', email: 'user@example.com', iat: ..., exp: ... }
```

### `extractTokenFromHeader(authHeader: string | null): string | null`

Extracts a token from an Authorization header.

```typescript
const token = extractTokenFromHeader('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
// Returns: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### `validatePassword(password: string): { isValid: boolean; error?: string }`

Validates a password meets minimum requirements.

```typescript
const result = validatePassword('mypassword');
// Returns: { isValid: true } or { isValid: false, error: 'Password must be at least 8 characters long' }
```

### `validateEmail(email: string): { isValid: boolean; error?: string }`

Validates an email format.

```typescript
const result = validateEmail('user@example.com');
// Returns: { isValid: true } or { isValid: false, error: 'Invalid email format' }
```

### `validateCredentials(email: string, password: string): { isValid: boolean; errors?: { email?: string; password?: string } }`

Validates both email and password.

```typescript
const result = validateCredentials('user@example.com', 'mypassword123');
// Returns: { isValid: true } or { isValid: false, errors: { email: '...', password: '...' } }
```

### `createSessionData(user: User): SafeUser`

Creates session data excluding the password field.

```typescript
const sessionData = createSessionData({
  id: 'user123',
  email: 'user@example.com',
  name: 'John Doe',
  password: 'hashedpassword'
});
// Returns: { id: 'user123', email: 'user@example.com', name: 'John Doe' }
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT signing (default: 'your-secret-key-change-in-production')
  - **Important**: Set this to a secure random string in production!

## Testing

Run the auth utilities tests:

```bash
npm run test:auth
```

The test suite includes:
- Password hashing and comparison tests
- JWT token generation and verification tests
- Token extraction tests
- Validation function tests
- Session data creation tests
- Integration flow tests

## Usage Examples

### User Registration Flow

```typescript
import { hashPassword, generateToken, validateCredentials } from './lib/auth';

// Validate credentials
const validation = validateCredentials(email, password);
if (!validation.isValid) {
  return { error: validation.errors };
}

// Hash password
const hashedPassword = await hashPassword(password);

// Create user in database
const user = createUser({ email, password: hashedPassword, name });

// Generate token
const token = await generateToken(user.id, user.email);

// Return token and safe user data
return { token, user: createSessionData(user) };
```

### User Login Flow

```typescript
import { comparePassword, generateToken, createSessionData } from './lib/auth';

// Find user by email
const user = findUserByEmail(email);
if (!user) {
  return { error: 'Invalid credentials' };
}

// Verify password
const isValid = await comparePassword(password, user.password);
if (!isValid) {
  return { error: 'Invalid credentials' };
}

// Generate token
const token = await generateToken(user.id, user.email);

// Return token and safe user data
return { token, user: createSessionData(user) };
```

### Protected Route Middleware

```typescript
import { extractTokenFromHeader, verifyToken } from './lib/auth';

export async function authMiddleware(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const payload = await verifyToken(token);
    // Attach user info to request
    return { userId: payload.userId, email: payload.email };
  } catch (error) {
    return new Response('Invalid token', { status: 401 });
  }
}
```

## Security Considerations

1. **Password Storage**: Passwords are never stored in plain text. Always use `hashPassword()` before storing.

2. **Token Security**: 
   - Tokens expire after 7 days
   - Use HTTPS in production to prevent token interception
   - Store tokens securely on the client (httpOnly cookies recommended)

3. **JWT Secret**: 
   - Change the default JWT_SECRET in production
   - Use a long, random string (at least 32 characters)
   - Never commit secrets to version control

4. **Error Messages**: 
   - Use generic error messages for authentication failures
   - Don't reveal whether email exists or password is wrong
   - Prevents user enumeration attacks

5. **Validation**: 
   - Always validate input on both client and server
   - Enforce minimum password length (8 characters)
   - Validate email format before processing

## Dependencies

- `bcryptjs`: Password hashing (^2.4.3)
- `jose`: JWT token handling for Edge runtime (^5.9.6)

## Requirements Satisfied

- **Requirement 8.1**: Passwords are hashed using bcrypt before storage
- **Requirement 8.2**: Passwords are never stored in plain text
- **Requirement 8.3**: Password verification uses hash comparison
- **Requirement 2.3**: JWT tokens are validated on protected endpoints
