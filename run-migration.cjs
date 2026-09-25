const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' 
});

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', '0009_job_status.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Running migration:', migrationPath);
    await pool.query(sql);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();