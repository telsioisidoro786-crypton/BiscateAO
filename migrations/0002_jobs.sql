create table if not exists jobs (
  id text primary key,
  category text not null,
  title text not null,
  description text not null,
  neighborhood text not null,
  budget_min integer,
  budget_max integer,
  urgency text not null default 'semana',
  preferred_worker_id text,
  created_at timestamptz not null default now()
);

create index if not exists jobs_created_at_idx on jobs (created_at desc);
create index if not exists jobs_category_idx on jobs (category);

create table if not exists proposals (
  id text primary key,
  job_id text not null references jobs(id) on delete cascade,
  worker_id text not null,
  amount integer not null,
  message text not null,
  eta text not null,
  created_at timestamptz not null default now()
);

create index if not exists proposals_job_id_idx on proposals (job_id);

insert into jobs (
  id, category, title, description, neighborhood, budget_min, budget_max, urgency, created_at
) values
  (
    'job-seed-1',
    'canalizador',
    'Torneira da cozinha a pingar sem parar',
    'A torneira nova ainda pinga de noite. Já fechei o registo. Preciso de alguém hoje.',
    'Viana',
    5000,
    8000,
    'hoje',
    now() - interval '2 hours'
  ),
  (
    'job-seed-2',
    'electricista',
    'Quadro a disparar quando liga o ferro',
    'Casa de um piso. O disjuntor cai sempre que a mama liga o ferro e o frigorífico.',
    'Camama',
    7000,
    12000,
    'hoje',
    now() - interval '5 hours'
  ),
  (
    'job-seed-3',
    'gerador',
    'Gerador da cantina não pega',
    'Kipor 5kva. Parou ontem à noite no meio do corte. Preciso para o serviço de amanhã.',
    'Cazenga',
    10000,
    18000,
    'amanha',
    now() - interval '8 hours'
  ),
  (
    'job-seed-4',
    'pedreiro',
    'Muro de fundo, cerca de 12 metros',
    'Muro de blocos com 1,8 m. Já tenho blocos no quintal. Cimento combinamos.',
    'Palanca',
    8000,
    15000,
    'semana',
    now() - interval '1 day'
  ),
  (
    'job-seed-5',
    'cabeleireira',
    'Tranças para menina de 9 anos, sábado',
    'Cabelo crespo, ombro. Prefiro em casa no Cazenga.',
    'Cazenga',
    3000,
    6000,
    'semana',
    now() - interval '3 hours'
  )
on conflict (id) do nothing;

insert into proposals (id, job_id, worker_id, amount, message, eta, created_at) values
  ('p-1a', 'job-seed-1', 'salvador-mateus', 6500, 'Posso ir hoje depois das 14h. Levo torneira de reserva se a tua não tiver reparo.', 'hoje às 14h', now() - interval '90 minutes'),
  ('p-1b', 'job-seed-1', 'esperanca-lopes', 7000, 'Estou no Cacuaco. Chego ainda hoje se o trânsito deixar. Material à parte.', 'hoje ao fim da tarde', now() - interval '40 minutes'),
  ('p-2a', 'job-seed-2', 'nelito-fernandes', 9000, 'Parece sobrecarga no mesmo circuito. Levo disjuntor e testo a linha.', 'em 2 horas', now() - interval '3 hours'),
  ('p-2b', 'job-seed-2', 'catarina-dias', 11000, 'Posso ir ao Kilamba e seguir para Camama ainda hoje.', 'hoje às 16h', now() - interval '2 hours'),
  ('p-3a', 'job-seed-3', 'paulo-gerador', 12000, 'Kipor 5kva conheço bem. Se for avulso, resolvo no local. Peça extra só se precisar.', 'hoje à noite', now() - interval '6 hours'),
  ('p-3b', 'job-seed-3', 'wilson-motores', 13500, 'Amanhã cedo na cantina, antes das 8h, para não perderes o serviço.', 'amanhã às 7h30', now() - interval '4 hours'),
  ('p-4a', 'job-seed-4', 'joka-baptista', 12000, '12 metros com dois ajudantes. Três dias de obra se o cimento chegar.', 'esta semana', now() - interval '20 hours'),
  ('p-4b', 'job-seed-4', 'adao-quilombo', 11000, 'Posso começar quinta. Muro de 1,8 m, prumo e capelo.', 'quinta-feira', now() - interval '12 hours'),
  ('p-5a', 'job-seed-5', 'rosa-manuel', 4500, 'Atendo em casa, no quintal. Sábado de manhã está livre.', 'sábado 9h', now() - interval '2 hours')
on conflict (id) do nothing;
