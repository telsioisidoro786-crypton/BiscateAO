alter table account_settings add column if not exists theme text default 'system';
alter table account_settings add column if not exists notify_proposals boolean default true;
alter table account_settings add column if not exists notify_messages boolean default true;
alter table account_settings add column if not exists notify_job_updates boolean default true;
alter table account_settings add column if not exists notify_reminders boolean default true;
alter table account_settings add column if not exists notify_email boolean default true;

-- Update existing rows to have defaults
update account_settings set 
  theme = coalesce(theme, 'system'),
  notify_proposals = coalesce(notify_proposals, true),
  notify_messages = coalesce(notify_messages, true),
  notify_job_updates = coalesce(notify_job_updates, true),
  notify_reminders = coalesce(notify_reminders, true),
  notify_email = coalesce(notify_email, true);