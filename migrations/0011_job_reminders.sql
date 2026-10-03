-- Track sent reminders to avoid spamming users
create table if not exists job_reminders (
  id text primary key,
  job_id text not null references jobs(id) on delete cascade,
  sent_at timestamptz not null default now()
);

create unique index if not exists job_reminders_job_id_idx on job_reminders (job_id);
create index if not exists job_reminders_sent_at_idx on job_reminders (sent_at);