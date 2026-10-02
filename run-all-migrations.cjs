const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' 
});

async function runAllMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`✅ ${file} completed`);
    } catch (err) {
      console.error(`❌ ${file} failed:`, err.message);
    }
  }
  await pool.end();
}

runAllMigrations().catch(console.error);