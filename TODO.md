# BiscateAO - TODO List para Produção

## 🔴 CRÍTICO - Segurança (URGENTE)
- [ ] Remover secrets do histórico do git (filter-branch já feito, verificar)
- [ ] Rotacionar BETTER_AUTH_SECRET (openssl rand -hex 32)
- [ ] Configurar GOOGLE_CLIENT_ID/SECRET no Vercel
- [ ] Configurar GITHUB_CLIENT_ID/SECRET no Vercel
- [ ] Configurar GOOGLE_CLIENT_ID/SECRET no Supabase Dashboard
- [ ] Configurar GitHub OAuth no Supabase Dashboard
- [ ] Verificar se .grok/app-env.json NÃO está no git (já no .gitignore?)

## 🔐 Auth Completo
- [ ] Implementar "Esqueci a senha" (forgot password)
- [ ] Implementar reset password
- [ ] Configurar email verification no Supabase
- [ ] Adicionar link "Esqueci a senha" na página de login
- [ ] Testar fluxo completo: signup → email verification → login

## 🔔 Push Notifications (Produção)
- [ ] Gerar VAPID keys reais: `npx web-push generate-vapid-keys`
- [ ] Configurar VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY no Vercel
- [ ] Criar Supabase Edge Function para envio de push
- [ ] Implementar server-side push nas server functions:
  - Nova proposta → push para cliente
  - Nova mensagem → push para ambos
  - Atualização de status → push para cliente/profissional
  - Lembrete 24h sem resposta

## 🖼️ Imagens/Avatares Reais
- [ ] Configurar Supabase Storage bucket "avatars"
- [ ] Upload de avatar no perfil (cliente + profissional)
- [ ] Upload de imagens de portfolio (profissional)
- [ ] Componente WorkerAvatar usar foto real
- [ ] Componente WorkerAvatar fallback para iniciais

## 🎴 OG Cards (Social Sharing)
- [ ] Criar src/lib/og/site.json
- [ ] Implementar geração dinâmica OG images (Vercel OG API)
- [ ] Meta tags dinâmicas por rota (/profissionais/$id, /pedidos/$id)

## 🧪 Testes
- [ ] Unit tests (Vitest): utils, store, auth helpers
- [ ] E2E tests (Playwright):
  - Signup → Email verification → Login
  - Publicar pedido → Ver propostas → Aceitar → Chat → Review
  - Criar perfil profissional → Editar → Disponibilidade
  - Favoritar profissional/pedido

## 🎨 UI/UX Polish
- [ ] Dark mode (toggle + persist)
- [ ] Loading skeletons em todas as páginas
- [ ] Estados empty/error em todas as listas
- [ ] Acessibilidade: focus visible, labels, contraste, teclado
- [ ] Dark mode toggle no header/configurações
- [ ] Avatar real upload (Supabase Storage)

## 📱 PWA Polish
- [ ] Service Worker update notification (já tem)
- [ ] Background sync testado
- [ ] Offline page personalizada
- [ ] Install prompt customizado

## 📧 Email/Notificações
- [ ] Configurar Resend/SendGrid no Vercel
- [ ] Email de boas-vindas
- [ ] Email de verificação
- [ ] Email de reset password
- [ ] Email de nova proposta
- [ ] Email de nova mensagem
- [ ] Email de lembrete 24h

## 🧪 Testes E2E (Playwright)
- [ ] Setup Playwright
- [ ] Test: Signup → Verify → Login → Create Job → Accept Proposal → Chat → Review
- [ ] Test: Professional signup → Profile → Availability → Proposal
- [ ] Test: Favorites persistence
- [ ] Test: Offline/Background sync

## 🚀 Deploy Vercel
- [ ] Configurar Environment Variables no Vercel Dashboard
- [ ] Configurar Supabase OAuth Redirect URLs
- [ ] Configurar Custom Domain (opcional)
- [ ] Testar deploy preview
- [ ] Configurar Custom Domain (opcional)