const { betterAuth } = require('better-auth');

async function test() {
  const auth = betterAuth({ secret: 'test-secret-that-is-at-least-32-chars-long', baseURL: 'http://localhost:8080' });
  
  // Try with proper body format
  const result = await auth.api.verifyEmail({
    body: { token: 'valid-token-here' },
  });
  console.log('Result type:', typeof result);
  console.log('Result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);