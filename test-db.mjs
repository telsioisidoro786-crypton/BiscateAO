import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' 
});
const res = await pool.query("SELECT * FROM professionals WHERE category = 'canalizador' LIMIT 5");
console.log('Results:', res.rows);
await pool.end();