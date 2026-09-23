-- Professionals (workers) table
create table if not exists professionals (
  id text primary key,
  name text not null,
  category text not null,
  neighborhood text not null,
  years integer not null default 0,
  rate_min integer not null,
  rate_max integer not null,
  rating numeric(3,1) not null default 0,
  jobs_count integer not null default 0,
  available_today boolean not null default false,
  bio text not null default '',
  skills text[] not null default '{}',
  response_mins integer not null default 60,
  whatsapp text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professionals_category_idx on professionals (category);
create index if not exists professionals_neighborhood_idx on professionals (neighborhood);
create index if not exists professionals_rating_idx on professionals (rating desc);
create index if not exists professionals_available_idx on professionals (available_today) where available_today = true;

-- Reviews table (linked to professionals)
create table if not exists professional_reviews (
  id text primary key,
  professional_id text not null references professionals(id) on delete cascade,
  author text not null,
  neighborhood text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  ago text not null,
  created_at timestamptz not null default now()
);

create index if not exists professional_reviews_professional_idx on professional_reviews (professional_id);

-- Seed professionals from catalog.ts (40 workers)
insert into professionals (
  id, name, category, neighborhood, years, rate_min, rate_max, rating, jobs_count,
  available_today, bio, skills, response_mins, whatsapp, verified
) values
  -- Pedreiros
  ('joka-baptista', 'Joaquim "Joka" Baptista', 'pedreiro', 'Palanca', 14, 9000, 15000, 4.9, 86,
   true, 'Obra miúda e muro de vedação. Trabalho com dois ajudantes. Material combinamos à parte.',
   '{"Muro", "Reboco", "Laje", "Blocos"}', 18, '244923001001', false),
  ('adao-quilombo', 'Adão Quilombo', 'pedreiro', 'Zango', 9, 8000, 13000, 4.7, 54,
   false, 'Casas novas no Zango e anexos. Posso levar ajudante se a obra pedir.',
   '{"Anexo", "Fundação", "Chão", "Reboco"}', 40, '244923001002', false),
  -- Electricistas
  ('nelito-fernandes', 'Nelito Fernandes', 'electricista', 'Viana', 8, 7000, 12000, 4.8, 71,
   true, 'Quadro, curtos, ligação de gerador à casa. Levo alicate e disjuntores comuns.',
   '{"Quadro", "Tomadas", "Gerador", "LED"}', 12, '244923001003', false),
  ('catarina-dias', 'Catarina Dias', 'electricista', 'Kilamba', 6, 8000, 14000, 4.9, 39,
   true, 'Apartamentos no Kilamba e Talatona. Instalação limpa, sem partir parede à toa.',
   '{"Apartamento", "Quadro", "Iluminação"}', 22, '244923001004', false),
  -- Canalizadores
  ('salvador-mateus', 'Salvador Mateus', 'canalizador', 'Cazenga', 11, 6000, 11000, 4.8, 92,
   true, 'Fuga, esgoto entupido, tanque e bomba. Chego de kupapata com a caixa de ferramentas.',
   '{"Fuga", "Esgoto", "Bomba", "Tanque"}', 9, '244923001005', false),
  ('esperanca-lopes', 'Esperança Lopes', 'canalizador', 'Cacuaco', 7, 6500, 12000, 4.6, 41,
   false, 'Casas no Cacuaco e Panguila. Trabalho em cisternas e ligações de tanque.',
   '{"Cisterna", "Cano PVC", "Chuveiro"}', 35, '244923001006', false),
  -- Cabeleireiras
  ('rosa-manuel', 'Rosa Manuel', 'cabeleireira', 'Cazenga', 12, 2500, 8000, 4.9, 210,
   true, 'Atendo em casa, no quintal sombreado. Tranças, corte, permanente. Marcação no WhatsApp.',
   '{"Tranças", "Corte", "Permanente", "Crianças"}', 15, '244923001007', false),
  ('quinzinho-barbas', 'Quinzinho Barbas', 'cabeleireira', 'Sambizanga', 10, 2000, 5000, 4.7, 164,
   true, 'Barba, degradê, linha. Cadeira à porta da loja. Sem espera longa à tarde.',
   '{"Barba", "Degradê", "Linha"}', 8, '244923001008', false),
  -- Pintores
  ('helder-pintura', 'Hélder da Silva', 'pintor', 'Camama', 9, 8000, 14000, 4.8, 58,
   true, 'Pinto com tinta boa se o cliente trouxer, ou eu compro com factura. Protejo o chão.',
   '{"Interior", "Exterior", "Gesso", "Massa"}', 25, '244923001009', false),
  ('feliciana-tinta', 'Feliciana Sousa', 'pintor', 'Talatona', 5, 10000, 18000, 4.9, 27,
   false, 'Acabamento fino em apartamento. Cores combinadas. Trabalho só com ajudante.',
   '{"Apartamento", "Acabamento", "Textura"}', 50, '244923001010', false),
  -- Soldadores
  ('mauro-solda', 'Mauro Capitão', 'soldador', 'Viana', 13, 10000, 18000, 4.8, 67,
   true, 'Portão, grade, tanque de água em chapa. Máquina minha. Medida no local.',
   '{"Portão", "Grade", "Tanque", "Corrimão"}', 20, '244923001011', false),
  ('nadir-ferro', 'Nadir Ferreira', 'soldador', 'Benfica', 8, 9000, 16000, 4.6, 33,
   true, 'Estruturas pequenas e reparação de portão. Posso ir ao ferro com o cliente.',
   '{"Reparação", "Portão", "Estrutura"}', 30, '244923001012', false),
  -- Técnicos de gerador
  ('paulo-gerador', 'Paulo Kiala', 'gerador', 'Cazenga', 10, 10000, 20000, 4.9, 88,
   true, 'Avulso, óleo, filtro, arranque. Trabalho em geradores de casa e de cantina.',
   '{"Avulso", "Arranque", "Revisão", "Transferência"}', 11, '244923001013', false),
  ('wilson-motores', 'Wilson Monteiro', 'gerador', 'Hoji-ya-Henda', 7, 9000, 17000, 4.7, 45,
   false, 'Honda, Kipor, chineses. Peças se houver na Roque; senão digo o prazo.',
   '{"Kipor", "Honda", "Peças"}', 28, '244923001014', false),
  -- Marceneiros
  ('domingos-madeira', 'Domingos Chitata', 'marceneiro', 'Rangel', 16, 12000, 25000, 4.9, 61,
   false, 'Portas, roupeiros, cozinha. Meço, desenho no caderno, confirmo preço antes de cortar.',
   '{"Roupeiro", "Porta", "Cozinha", "Cama"}', 45, '244923001015', false),
  ('jacinta-moveis', 'Jacinta Ndala', 'marceneiro', 'Maianga', 8, 11000, 22000, 4.8, 29,
   true, 'Móveis à medida para T1 e T2. Melamina e madeira maciça.',
   '{"Melamina", "Prateleiras", "Secretária"}', 33, '244923001016', false),
  -- Limpeza
  ('teresa-casa', 'Teresa Ganga', 'limpeza', 'Kilamba', 6, 5000, 9000, 4.8, 73,
   true, 'Casa e escritório. Levo produtos se pedires. Pós-obra também, com tempo extra.',
   '{"Casa", "Pós-obra", "Escritório"}', 16, '244923001017', false),
  ('irene-brilho', 'Irene Baptista', 'limpeza', 'Talatona', 4, 6000, 10000, 4.7, 38,
   true, 'Trabalho sozinha ou com colega para casas grandes. Referências no bairro.',
   '{"Casa", "Vidros", "Roupa"}', 20, '244923001018', false),
  -- Mecânicos
  ('mateus-oficina', 'Mateus "Teco" António', 'mecanico', 'Viana', 15, 7000, 15000, 4.8, 120,
   true, 'Carro e moto. Diagnóstico honesto — se não for, digo. Oficina no fundo do quintal.',
   '{"Travões", "Embraiagem", "Moto", "Revisão"}', 14, '244923001019', false),
  ('aminah-motos', 'Amina dos Santos', 'mecanico', 'Cacuaco', 5, 5000, 10000, 4.9, 64,
   true, 'Kupapatas e motos chinesas. Corrente, pneu, electricidade da moto.',
   '{"Kupapata", "Pneus", "Elétrica"}', 10, '244923001020', false),
  -- Costureiras
  ('luzia-linha', 'Luzia Pimentel', 'costureira', 'Sambizanga', 18, 3000, 12000, 5.0, 95,
   false, 'Fatos, fardas, ajustes. Prova em casa. Entrega combinada, sem faltar à missa de domingo.',
   '{"Fato", "Ajuste", "Farda", "Vestido"}', 40, '244923001021', false),
  ('deolinda-agulha', 'Deolinda Cruz', 'costureira', 'Palanca', 9, 2500, 9000, 4.7, 52,
   true, 'Uniformes escolares e arranjos rápidos. Máquina em casa, na Palanca.',
   '{"Uniforme", "Bainha", "Zíper"}', 18, '244923001022', false),
  -- Técnicos de AC
  ('bernardo-frio', 'Bernardo Fria', 'ac', 'Talatona', 11, 12000, 22000, 4.8, 77,
   true, 'Instalação e recarga de gás. Split até 24 mil BTU. Limpeza de filtros incluída na visita de revisão.',
   '{"Instalação", "Gás", "Limpeza", "Split"}', 24, '244923001023', false),
  ('helder-split', 'Hélder Split', 'ac', 'Kilamba', 6, 10000, 18000, 4.6, 34,
   true, 'Revisão e instalação em apartamento. Trabalho ao sábado de manhã.',
   '{"Revisão", "Instalação", "Apartamento"}', 32, '244923001024', false)
on conflict (id) do nothing;

-- Seed reviews
insert into professional_reviews (id, professional_id, author, neighborhood, rating, text, ago) values
  -- Joka Baptista
  ('r-1', 'joka-baptista', 'Teresa', 'Palanca', 5, 'Fez o muro de fundo em três dias. Deixou o quintal limpo. Homem de palavra.', 'há 2 semanas'),
  ('r-2', 'joka-baptista', 'Mauro', 'Viana', 5, 'Reboco da sala ficou direito. Preço combinado, sem surpresa.', 'há 1 mês'),
  -- Adão Quilombo
  ('r-3', 'adao-quilombo', 'Irene', 'Zango', 5, 'Fez o anexo da mama. Chegou cedo todos os dias.', 'há 3 semanas'),
  -- Nelito Fernandes
  ('r-4', 'nelito-fernandes', 'Luzia', 'Viana', 5, 'Resolveu o quadro da casa da mama no mesmo dia. Explicou o que estava queimado.', 'há 5 dias'),
  ('r-5', 'nelito-fernandes', 'Paulo', 'Camama', 4, 'Bom trabalho. Só atrasou meia hora no trânsito.', 'há 3 semanas'),
  -- Catarina Dias
  ('r-6', 'catarina-dias', 'Hélder', 'Kilamba', 5, 'Trocou o quadro do T3 sem deixar o chão sujo. Rara.', 'há 1 semana'),
  -- Salvador Mateus
  ('r-7', 'salvador-mateus', 'Deolinda', 'Cazenga', 5, 'A casa estava a alagar. Veio em 40 minutos e parou a água.', 'há 4 dias'),
  ('r-8', 'salvador-mateus', 'Wilson', 'Hoji-ya-Henda', 5, 'Trocou a torneira e o sifão. Preço justo.', 'há 2 semanas'),
  -- Esperança Lopes
  ('r-9', 'esperanca-lopes', 'Nadir', 'Cacuaco', 5, 'Ligou o tanque novo à bomba. Água chegou à laje.', 'há 1 mês'),
  -- Rosa Manuel
  ('r-10', 'rosa-manuel', 'Amina', 'Cazenga', 5, 'Tranças da miúda aguentaram o mês todo. Mãos leves.', 'há 6 dias'),
  ('r-11', 'rosa-manuel', 'Jacinta', 'Rangel', 5, 'Corte e tratamento. Sai daqui outra pessoa.', 'há 3 semanas'),
  -- Quinzinho Barbas
  ('r-12', 'quinzinho-barbas', 'Domingos', 'Sambizanga', 5, 'Melhor degradê do bairro. Rápido e limpo.', 'há 2 dias'),
  -- Hélder da Silva
  ('r-13', 'helder-pintura', 'Maria', 'Camama', 5, 'Sala e dois quartos em dois dias. Cheiro saiu rápido.', 'há 1 semana'),
  -- Feliciana Sousa
  ('r-14', 'feliciana-tinta', 'Bernardo', 'Talatona', 5, 'Pintou o T2 como se fosse casa nova. Detalhe nas caixas.', 'há 2 semanas'),
  -- Mauro Capitão
  ('r-15', 'mauro-solda', 'Salvador', 'Viana', 5, 'Portão novo em chapa. Fechou direito à primeira.', 'há 8 dias'),
  ('r-16', 'mauro-solda', 'Teresa', 'Benfica', 4, 'Grade da janela sólida. Entrega atrasou um dia.', 'há 1 mês'),
  -- Nadir Ferreira
  ('r-17', 'nadir-ferro', 'Joaquim', 'Benfica', 5, 'Soldou o portão que os miúdos partiram. Ficou mais forte.', 'há 12 dias'),
  -- Paulo Kiala
  ('r-18', 'paulo-gerador', 'Rosa', 'Cazenga', 5, 'O gerador da cantina não pega. Veio à noite e deixou a trabalhar.', 'há 3 dias'),
  ('r-19', 'paulo-gerador', 'Adão', 'Palanca', 5, 'Revisão completa. Explicou o consumo de gasóleo.', 'há 3 semanas'),
  -- Wilson Monteiro
  ('r-20', 'wilson-motores', 'Luzia', 'Hoji-ya-Henda', 5, 'Trocou o avulso e o filtro. Barulho baixou.', 'há 2 semanas'),
  -- Domingos Chitata
  ('r-21', 'domingos-madeira', 'Catarina', 'Rangel', 5, 'Roupeiro de três portas. Madeira boa, dobradiças a sério.', 'há 1 mês'),
  -- Jacinta Ndala
  ('r-22', 'jacinta-moveis', 'Hélder', 'Maianga', 5, 'Aproveitou um recanto morto. Ficou uma secretária perfeita.', 'há 9 dias'),
  -- Teresa Ganga
  ('r-23', 'teresa-casa', 'Feliciana', 'Kilamba', 5, 'Deixou o T3 a brilhar antes dos visitas. Pontual.', 'há 4 dias'),
  -- Irene Baptista
  ('r-24', 'irene-brilho', 'Nadir', 'Talatona', 5, 'Discreta e rápida. A cozinha ficou nova.', 'há 1 semana'),
  -- Mateus "Teco" António
  ('r-25', 'mateus-oficina', 'Paulo', 'Viana', 5, 'A Toyota estava a gastar óleo. Apertou e explicou. Sem conto.', 'há 6 dias'),
  -- Amina dos Santos
  ('r-26', 'aminah-motos', 'Quinzinho', 'Cacuaco', 5, 'A moto não pegava. Fio solto. 20 minutos, preço de verdade.', 'há 2 dias'),
  -- Luzia Pimentel
  ('r-27', 'luzia-linha', 'Maria', 'Sambizanga', 5, 'O fato do marido para o casamento. Caía que nem luva.', 'há 3 semanas'),
  -- Deolinda Cruz
  ('r-28', 'deolinda-agulha', 'Esperança', 'Palanca', 5, 'Três fardas da escola em dois dias. Pontos direitos.', 'há 1 semana'),
  -- Bernardo Fria
  ('r-29', 'bernardo-frio', 'Catarina', 'Talatona', 5, 'Instalou o split no quarto. Furo limpo, água a escorrer para fora.', 'há 5 dias'),
  -- Hélder Split
  ('r-30', 'helder-split', 'Wilson', 'Kilamba', 4, 'Limpeza profunda. O ar voltou a gelar. Um pouco de pó no chão.', 'há 2 semanas')
on conflict (id) do nothing;