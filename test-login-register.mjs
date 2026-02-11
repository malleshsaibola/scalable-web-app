/**
 * Test script for login and register endpoints
 */

const BASE_URL = 'http://localhost:3000';

async function testRegister() {
  console.log('\n=== Testing Register Endpoint ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✓ Register successful');
      return data.token;
    } else {
      console.log('✗ Register failed');
      return null;
    }
  } catch (error) {
    console.error('✗ Register error:', error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n=== Testing Login Endpoint ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✓ Login successful');
      return data.token;
    } else {
      console.log('✗ Login failed');
      return null;
    }
  } catch (error) {
    console.error('✗ Login error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('Starting authentication tests...');
  console.log('Make sure the dev server is running on port 3000');
  
  await testLogin();
  await testRegister();
  
  console.log('\n=== Tests Complete ===');
}

runTests();
