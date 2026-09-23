import { professionalsByCategory } from './src/lib/professionals.ts';

async function test() {
  try {
    const professionals = await professionalsByCategory('canalizador', 100);
    console.log('Success:', professionals.length, 'professionals');
    console.log('First:', professionals[0]);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();