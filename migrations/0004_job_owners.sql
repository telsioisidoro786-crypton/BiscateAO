alter table jobs add column if not exists user_id text;

update jobs set user_id = 'seed-user' where user_id is null;

alter table jobs alter column user_id set not null;

create index if not exists jobs_user_id_idx on jobs (user_id);
