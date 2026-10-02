const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_0neyKFIbS4Hf@ep-holy-surf-b5esi84v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("select id, category, title, description, neighborhood, budget_min, budget_max, urgency, preferred_worker_id, status, accepted_proposal_id, created_at::text as created_at from jobs where ($1::text is null or category = $1) and ($2::text is null or neighborhood = $2) order by created_at desc limit 40", [null, null])
  .then(res => console.log('Jobs:', res.rows.length, res.rows.slice(0, 3)))
  .catch(err => console.error('DB error:', err.message))
  .finally(() => pool.end());