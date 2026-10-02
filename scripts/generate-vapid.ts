#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push
 * Run: npx tsx scripts/generate-vapid.ts
 */
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===');
console.log('');
console.log('Public Key (VITE_VAPID_PUBLIC_KEY):');
console.log(keys.publicKey);
console.log('');
console.log('Private Key (VAPID_PRIVATE_KEY):');
console.log(keys.privateKey);
console.log('');
console.log('Add to your .env or platform environment:');
console.log(`VITE_VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log(`VAPID_EMAIL="mailto:contato@biscateao.app"`);