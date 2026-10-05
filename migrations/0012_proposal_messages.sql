-- Proposal messages (pre-acceptance chat between client and professional)
create table if not exists proposal_messages (
  id text primary key,
  proposal_id text not null references proposals(id) on delete cascade,
  user_id text not null,
  sender_role text not null check (sender_role in ('cliente', 'profissional')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists proposal_messages_proposal_id_idx on proposal_messages (proposal_id, created_at);
create index if not exists proposal_messages_user_id_idx on proposal_messages (user_id);

-- Enable realtime for proposal_messages (optional, for future live updates)
-- alter publication supabase_realtime add table proposal_messages;