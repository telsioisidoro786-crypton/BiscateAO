import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' 
});

async function test() {
  try {
    const rows = await pool.query(
      `select category as slug, count(*) as count
       from professionals
       group by category
       order by count desc`
    );
    console.log('Categories with counts:', rows.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

test();