create table if not exists account_settings (
  user_id text primary key references "user"("id") on delete cascade,
  default_neighborhood text,
  updated_at timestamptz not null default now()
);
