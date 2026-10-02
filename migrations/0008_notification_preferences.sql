alter table account_settings
  add column if not exists notify_proposals boolean not null default true,
  add column if not exists notify_messages boolean not null default true,
  add column if not exists notify_job_updates boolean not null default true,
  add column if not exists notify_reminders boolean not null default true,
  add column if not exists notify_email boolean not null default true;

create table if not exists push_subscriptions (
  id text primary key,
  user_id text not null references "user"("id") on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_id_idx on push_subscriptions(user_id);
