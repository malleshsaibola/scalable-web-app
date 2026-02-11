/**
 * Debug script for registration endpoint
 */

const BASE_URL = 'http://localhost:3000';

async function testRegister(email, password, name) {
  console.log('\n=== Testing Register ===');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Name:', name);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    
    console.log('\nStatus:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✓ Registration successful');
    } else {
      console.log('✗ Registration failed');
      console.log('Error:', data.message);
      if (data.details) {
        console.log('Details:', JSON.stringify(data.details, null, 2));
      }
    }
  } catch (error) {
    console.error('✗ Network error:', error.message);
  }
}

// Test cases
async function runTests() {
  console.log('Make sure dev server is running on port 3000\n');
  
  // Test 1: Valid registration
  await testRegister('newuser@example.com', 'password123', 'New User');
  
  // Test 2: Duplicate email
  await testRegister('test@example.com', 'password123', 'Test User');
  
  // Test 3: Short password
  await testRegister('another@example.com', 'short', 'Another User');
  
  // Test 4: Invalid email
  await testRegister('invalidemail', 'password123', 'Invalid User');
  
  // Test 5: Missing name
  await testRegister('noname@example.com', 'password123', '');
}

runTests();
