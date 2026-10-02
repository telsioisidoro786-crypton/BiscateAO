const { betterAuth } = require('better-auth');

async function test() {
  const auth = betterAuth({ secret: 'test', baseURL: 'http://localhost:8080' });
  const result = await auth.api.verifyEmail({ body: { token: 'test' } });
  console.log('Result type:', typeof result);
  console.log('Result keys:', Object.keys(result || {}));
  console.log('Result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);