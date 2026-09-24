create unique index if not exists proposals_job_worker_unique_idx on proposals (job_id, worker_id);
create index if not exists jobs_category_status_created_idx on jobs (category, status, created_at desc);
