import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' 
});

async function test() {
  try {
    const rows = await pool.query(
      `select id, name, category, neighborhood, years, rate_min, rate_max, rating,
              jobs_count, available_today, bio, skills, response_mins, whatsapp,
              verified, created_at, updated_at
       from professionals
       where category = $1
       order by rating desc, jobs_count desc
       limit $2`,
      ['canalizador', 100]
    );
    console.log('Success:', rows.rows.length, 'professionals');
    console.log('First:', rows.rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

test();