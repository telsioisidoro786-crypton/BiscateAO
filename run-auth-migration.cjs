const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' 
});

async function runMigration() {
  const client = await pool.connect();
  try {
    // Create _migrations table if not exists
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    );
    
    // Check if auth migration already applied
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(r => r.name);
    console.log('Already applied migrations:', applied);
    
    const authMigrationPath = path.join(__dirname, 'migrations', 'auth', '0001_auth.sql');
    const migrationName = 'auth/0001_auth.sql';
    
    if (applied.includes(migrationName)) {
      console.log('Auth migration already applied');
      return;
    }
    
    const sql = fs.readFileSync(authMigrationPath, 'utf8');
    console.log('Running auth migration:', migrationName);
    
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO _migrations (name) VALUES ($1)", [migrationName]);
    await client.query("COMMIT");
    
    console.log('Auth migration applied successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();