# Análise de Melhorias — BiscateAO

> **Status atual**: App funcional em modo demo (dados mock, localStorage, sem backend real).  
> **Objetivo**: Transformar em produto lançável (MVP → v1.0) com backend, pagamentos, notificações, PWA offline, SEO, acessibilidade, testes.

---

## 1. Arquitetura & Backend (Crítico)

| Item | Atual | Necessário | Esforço |
|------|-------|------------|---------|
| **Persistência real** | Mock em `catalog.ts` + localStorage | Postgres (Neon) + migrações existentes (`0002_jobs.sql`) | Médio |
| **API server** | TanStack Start loaders/actions (SSR) | Endpoints REST + WebSockets para tempo real | Médio |
| **Autenticação** | Better Auth pré-configurado, **OFF** | **ON** — login WhatsApp/OTP + sessão persistida | Médio |
| **Row-level security** | Não existe | Policies por `user_id` em jobs, propostas, chats | Baixo |
| **Jobs queue** | Não existe | BullMQ/Redis para: notificações, expirar pedidos, reminders | Médio |

**Ações imediatas**:
1. Ativar `VITE_AUTH_ENABLED=1` → cria `src/routes/login.tsx` + `src/routes/api/auth/$.ts` (skill `auth`)
2. Ajustar `migrations/0002_jobs.sql` para incluir `user_id` + RLS
3. Mover `WORKERS` mock → seed SQL + tabela `professionals` com verificação de documentos
4. Criar `src/lib/db.ts` (já existe) e usar em loaders/actions reais

---

## 2. Funcionalidades de Produto (Alto Impacto)

### 2.1 Fluxo de Pedido → Proposta → Contratação
- [ ] **Publicar pedido** → salva no DB, notifica pros do bairro (push + WhatsApp)
- [ ] **Proposta**: pro envia preço, prazo, mensagem → cliente vê cards comparativos
- [ ] **Aceitar proposta** → abre chat dedicado (WhatsApp deep link + chat interno p/ histórico)
- [ ] **Status**: `aberto` → `orçando` → `aceito` → `em_andamento` → `concluido` / `cancelado`
- [ ] **Avaliação obrigatória** ao concluir (estrela + texto) → entra no rating do pro

### 2.2 Perfil Profissional (Trust)
- [ ] Verificação de identidade (BI + selfie) → badge "Verificado"
- [ ] Portfólio de fotos (upload → Supabase Storage / S3)
- [ ] Certificações / cursos (ex: NR10 p/ electricista)
- [ ] Horário de atendimento + raio de deslocamento (km)
- [ ] Métricas: tempo médio resposta, taxa conclusão, % clientes repetidos

### 2.3 Busca & Descoberta
- [ ] Filtros: preço, nota, disponibilidade hoje, distância, verificado
- [ ] Ordenação: "melhor match" (bairro + nota + resposta rápida)
- [ ] Autocomplete na busca (ofício + bairro)
- [ ] Mapa simples (Leaflet/MapLibre) p/ ver pros no bairro

### 2.4 Chat & Notificações
- [ ] Chat interno (WebSocket) + botão "Abrir no WhatsApp" (pre-filled)
- [ ] Push notifications (Web Push API + VAPID) → "Novo orçamento", "Pro a caminho"
- [ ] Email/SMS fallback p/ quem não tem push
- [ ] Templates de mensagem rápida ("Aceito seu preço", "Quando pode vir?")

### 2.5 Pagamentos (Monetização)
| Fase | Modelo |
|------|--------|
| MVP | **Lead fee**: pro paga Kz 500–2000 p/ ver contato do cliente (créditos) |
| v1.1 | **Escrow opcional**: cliente deposita, libera p/ pro ao concluir (taxa 5%) |
| v1.2 | **Assinatura Pro**: Kz 15k/mês = leads ilimitados + badge + destaque |

---

## 3. UX/UI & Design System (Design-UI Skill)

### 3.1 Tokens & Consistência
- [ ] Extrair cores/tipografia/espaçamento p/ `tailwind.config.ts` (hoje hardcoded em classes)
- [ ] Dark mode real (hoje só `bg-bg text-ink` — falta `dark:` variant)
- [ ] Componente `Button` unificado (hoje mistura `Button` Radix + classes inline)
- [ ] `Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup` padronizados

### 3.2 Páginas-chave
| Página | Problema | Solução |
|--------|----------|---------|
| **Home** | Hero imagem fixa, busca simples | Carrossel de categorias, chips de bairro, skeleton loading |
| **Lista pros** | Cards repetitivos, sem filtro | Sidebar filtros (mobile: bottom sheet), ordenação, paginação infinita |
| **Perfil pro** | Info densa, sem hierarquia | Tabs: Sobre / Avaliações / Portfólio / Disponibilidade |
| **Formulário pedido** | Validação fraca, sem preview | React Hook Form + Zod (já instalado), stepper 3 passos, preview WhatsApp |
| **Pedidos** | Lista estática | Kanban (colunas por status), drag-drop, realtime |

### 3.3 Mobile-First
- [ ] Bottom nav (já existe) + swipe gestures p/ drawer
- [ ] Touch targets ≥ 44px (verificar `WorkerCard`, botões)
- [ ] Safe-area insets (iOS notch) — já usa `env(safe-area-inset-bottom)` ✓
- [ ] PWA install prompt customizado (já tem `/__grok/install/`)

---

## 4. PWA & Offline (Crítico p/ Angola)

| Feature | Status | Ação |
|---------|--------|------|
| **Service Worker** | `grok-pwa-plugin` injeta manifest | Adicionar `workbox-precaching` + `stale-while-revalidate` p/ assets + API GET |
| **Offline-first** | Não | Cache últimas buscas, perfis vistos, meus pedidos → IndexedDB (idb) |
| **Background Sync** | Não | Enviar proposta/chat offline → sync quando volta |
| **Push Notifications** | Não | Web Push + VAPID key → service worker `push` event |
| **Install prompt** | Template genérico | Customizado: "Adicionar BiscateAO à tela inicial → acesse offline" |

---

## 5. SEO & Share Cards (OG Skill)

- [ ] `src/lib/og/site.json` + meta tags dinâmicas por rota (`/profissionais/$id`, `/pedidos/$id`)
- [ ] JSON-LD `LocalBusiness` + `Service` + `Review` em páginas de pro/pedido
- [ ] Sitemap.xml + robots.txt (gerado no build)
- [ ] Open Graph images dinâmicas (OG skill: `generate2dsprite` p/ cards de pro/pedido)
- [ ] Canonical URLs + hreflang `pt-AO`

---

## 6. Acessibilidade (WCAG 2.1 AA)

| Check | Status | Ação |
|-------|--------|------|
| Contraste cores | Parcial (ink/surface ok, muted/primary-fg ?) | Auditar com `axe-core` no CI |
| Navegação teclado | Parcial (Radix ajuda) | Testar `Tab`, `Enter`, `Esc` em todos modals/drawers |
| ARIA labels | Faltando em inputs/botões ícone | Adicionar `aria-label` / `aria-describedby` |
| Focus visible | Tailwind `focus-visible:ring` | Garantir em todos componentes interativos |
| Screen reader | Não testado | Testar NVDA/VoiceOver em fluxos críticos |
| Reduzir movimento | Não | `@media (prefers-reduced-motion)` p/ animações |

---

## 7. Testes & Qualidade

| Tipo | Atual | Meta |
|------|-------|------|
| **Unit** | Alguns em `scripts/*.test.mjs` | Vitest + React Testing Library p/ hooks/utils/components |
| **Integration** | Zero | Testar loaders/actions com MSW (mock DB) |
| **E2E** | Playwright instalado, sem specs | Specs: login → publicar pedido → receber proposta → aceitar → avaliar |
| **Visual** | Screenshots manuais em `screenshots/` | Chromatic / Playwright snapshot testing |
| **Typecheck** | `npm run typecheck` passa | `strict: true` no tsconfig (já?) + zero `any` |
| **Lint/Format** | ESLint + Prettier | CI gate: `lint` + `typecheck` + `test` + `build` |

---

## 8. Performance

- [ ] **Code splitting**: routes já lazy por TanStack Router ✓
- [ ] **Imagens**: WebP/AVIF + `srcset` + `loading=lazy` (hero já lazy ✓)
- [ ] **Fonts**: `font-display: swap` (Google Fonts já) + pré-carregar `Bricolage Grotesque`
- [ ] **Bundle**: analisar com `vite-bundle-analyzer` → remover lodash, date-fns locales extras
- [ ] **SSR streaming**: TanStack Start suporta → habilitar p/ home / lista pros
- [ ] **Cache headers**: `Cache-Control: public, max-age=31536000, immutable` p/ assets hashed

---

## 9. Segurança & LGPD (Angola)

- [ ] **HTTPS only** (Vercel força) + HSTS
- [ ] **CSP** restritivo (permitir `grok.com` p/ branding injector)
- [ ] **Sanitização**: inputs → Zod + DOMPurify p/ bio/descrição
- [ ] **Rate limit**: `/api/pedidos`, `/api/propostas`, `/api/chat` (Upstash Ratelimit)
- [ ] **LGPD Angola**: termo consentimento, exportar dados, deletar conta, DPO contato
- [ ] **Secrets**: zero no client — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `VAPID_KEYS` só server

---

## 10. Observabilidade & Operação

- [ ] **Sentry** (error tracking + performance) — DSN em env
- [ ] **Logs estruturados** (pino) → Vercel Logs / Better Stack
- [ ] **Métricas negócio**: pedidos/dia, taxa conversão, NPS, churn pros
- [ ] **Healthcheck** `/api/health` → uptime monitor
- [ ] **Feature flags** (LaunchDarkly/Unleash) p/ rollout gradual

---

## 11. Priorização Sugerida (Roadmap 12 semanas)

| Sprint | Foco | Entregável |
|--------|------|------------|
| **1–2** | **Backend real + Auth** | Postgres Neon, migrações, login OTP WhatsApp, RLS, seed pros |
| **3–4** | **Fluxo completo** | Publicar pedido → propostas → aceitar → chat → avaliar (E2E) |
| **5** | **Perfil Pro + Trust** | Verificação, portfólio, badge, métricas |
| **6** | **Busca + Mapa** | Filtros, ordenação, mapa Leaflet, autocomplete |
| **7** | **PWA Offline + Push** | SW, IndexedDB cache, Web Push, background sync |
| **8** | **Pagamentos (Lead Fee)** | Créditos Pro, Stripe/Multicaixa/Unitel Money, webhook |
| **9** | **Design System + A11y** | Tokens, dark mode, componentes padronizados, axe-core CI |
| **10** | **SEO + OG Cards** | JSON-LD, sitemap, images dinâmicas, meta tags |
| **11** | **Testes + Observabilidade** | Unit/E2E/Visual, Sentry, logs, healthcheck |
| **12** | **Polish + Launch** | Bug bash, performance, docs, deploy produção |

---

## 12. Decisões Técnicas Pendentes (Precisam do Teu Input)

1. **Auth**: WhatsApp OTP (Twilio/Vonage) vs. Google/Apple + telefone? Angola usa WhatsApp nativo.
2. **Pagamentos**: Multicaixa Express / Unitel Money / Stripe (cartão) — qual prioridade?
3. **Maps**: Leaflet (grátis, OSM) vs. MapLibre (vetorial, self-host) vs. Google Maps (caro)?
4. **Push**: Web Push (grátis, VAPID) vs. OneSignal (grátis até 10k) vs. Firebase (complexo)?
5. **Storage fotos**: Supabase Storage (grátis 1GB) vs. Cloudflare R2 (barato) vs. S3?
6. **Realtime**: TanStack Start WebSockets vs. Pusher/Ably vs. Supabase Realtime?
7. **Monetização**: Lead fee (simples) vs. Escrow (confiança) vs. Assinatura (recorrência)?

---

## Próximos Passos Imediatos (Esta Semana)

1. ✅ `npm install` → `npm run dev` funcionando
2. 🔧 Ativar **Auth** (skill `auth`) → criar `login.tsx` + `api/auth/$.ts`
3. 🔧 Conectar **Neon Postgres** (`DATABASE_URL` já injetado no deploy)
4. 🔧 Migrar `WORKERS` mock → seed SQL + tabela `professionals`
5. 🔧 Substituir loaders mock por queries reais (`src/lib/jobs.ts`, `src/lib/catalog.ts` → DB)
6. 🔧 Rodar `npm run build` + `npm run typecheck` → zerar erros

---

> **Quer que eu comece por qual item?** Sugiro: **Auth + Neon DB + seed real** (itens 2–5 acima) — isso desbloqueia tudo o resto. Me diga se concordas ou queres outra prioridade.