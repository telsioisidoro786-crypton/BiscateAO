alter table jobs add column if not exists status text not null default 'aberto';
alter table jobs add column if not exists accepted_proposal_id text;
alter table jobs add column if not exists completed_at timestamptz;
alter table jobs add column if not exists cancelled_at timestamptz;

create table if not exists saved_professionals (
  user_id text not null,
  professional_id text not null references professionals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, professional_id)
);

create table if not exists job_messages (
  id text primary key,
  job_id text not null references jobs(id) on delete cascade,
  user_id text not null,
  sender_role text not null check (sender_role in ('cliente', 'profissional')),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists job_messages_job_id_idx on job_messages (job_id, created_at);

create table if not exists job_reviews (
  id text primary key,
  job_id text not null unique references jobs(id) on delete cascade,
  user_id text not null,
  professional_id text not null references professionals(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz not null default now()
);

alter table professionals add column if not exists owner_user_id text;
alter table professionals add column if not exists profile_status text not null default 'ativo';
create unique index if not exists professionals_owner_user_id_idx on professionals (owner_user_id) where owner_user_id is not null;
