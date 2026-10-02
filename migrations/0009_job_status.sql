alter table jobs add column if not exists status text not null default 'aberto';
alter table jobs add column if not exists accepted_proposal_id text;
alter table jobs add column if not exists cancelled_at timestamptz;
alter table jobs add column if not exists completed_at timestamptz;

update jobs set status = 'aberto' where status is null;

create index if not exists jobs_status_idx on jobs (status);