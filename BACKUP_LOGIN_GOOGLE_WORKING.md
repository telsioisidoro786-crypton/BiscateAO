# BACKUP - Login Google Funcionando ✅

**Data:** 2026-10-05
**Commit:** `cb57530` - fix(api): restore api/ folder with inlined auth config
**Tag:** `backup-login-google-funcionando`
**Branch:** `backup/login-google-working`

---

## ✅ O QUE FUNCIONA AGORA

| Feature | Status | Endpoint |
|---------|--------|----------|
| **Login com Google** | ✅ FUNCIONANDO | `POST /api/auth/sign-in/social` |
| **Login com GitHub** | ✅ Configurado | `POST /api/auth/sign-in/social` |
| **Callback Google** | ✅ Funcionando | `GET /api/auth/callback/google` |
| **Callback GitHub** | ✅ Configurado | `GET /api/auth/callback/github` |
| **Email/Password Sign In** | ✅ Funcionando | `POST /api/auth/sign-in/email` |
| **Email/Password Sign Up** | ✅ Funcionando | `POST /api/auth/sign-up/email` |
| **Forgot Password** | ✅ Funcionando | `POST /api/auth/forgot-password` |
| **Reset Password** | ✅ Funcionando | `POST /api/auth/reset-password` |
| **Sign Out** | ✅ Funcionando | `POST /api/auth/sign-out` |
| **Get Session** | ✅ Funcionando | `GET /api/auth/get-session` |
| **Providers List** | ✅ Funcionando | `GET /api/auth/providers` |

---

## 📁 ARQUIVOS CRÍTICOS (NÃO MEXER)

### Vercel Serverless Functions (`api/`)
```
api/
├── auth/
│   ├── get-session.js        ✅ Session check
│   ├── providers.js          ✅ OAuth providers list
│   ├── sign-in/
│   │   ├── social.js         ✅ Google/GitHub login (PRINCIPAL)
│   │   ├── oauth2.js         ✅ OAuth2 alternativo
│   │   └── email.js          ✅ Email/password login
│   ├── sign-up/
│   │   └── email.js          ✅ Email/password signup
│   ├── sign-out.js           ✅ Logout
│   ├── reset-password.js     ✅ Reset password
│   ├── forgot-password.js    ✅ Forgot password
│   └── callback/
│       ├── google.js         ✅ Google OAuth callback
│       └── github.js         ✅ GitHub OAuth callback
└── lib/
    └── email/
        └── resend.js         ✅ Email utilities (Resend)
```

### Better Auth Config (Inlined em cada function)
Cada arquivo em `api/auth/` contém o **config completo do Better Auth inlined** — isso evita imports cross-function que causavam `ERR_MODULE_NOT_FOUND`.

**Config padrão (copiado em todos):**
```javascript
const auth = betterAuth({
  baseURL: "https://biscate-ao-seven.vercel.app",
  secret: env("BETTER_AUTH_SECRET") ?? "dev-secret-change-in-production",
  database: database ?? { type: "postgres" },
  trustedOrigins: ["http://localhost:8080", "http://127.0.0.1:8080", "https://*.grok-sandbox.com", "https://biscate-ao-seven.vercel.app"].filter(Boolean),
  socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
  emailAndPassword: { enabled: true },
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: "__Host-session_token" },
      session_data: { name: "__Host-session_data" },
      account_data: { name: "__Host-account_data" },
    },
  },
});
```

---

## 🔧 VARIÁVEIS DE AMBIENTE (Vercel)

| Variável | Obrigatória | Status |
|----------|-------------|--------|
| `BETTER_AUTH_SECRET` | ✅ Sim | Configurada |
| `GOOGLE_CLIENT_ID` | ✅ Sim | Configurada |
| `GOOGLE_CLIENT_SECRET` | ✅ Sim | Configurada |
| `GITHUB_CLIENT_ID` | ⚠️ Opcional | Configurada |
| `GITHUB_CLIENT_SECRET` | ⚠️ Opcional | Configurada |
| `RESEND_API_KEY` | ✅ Para emails | Configurada |
| `DATABASE_URL` | ✅ Sim | Configurada |
| `BETTER_AUTH_URL` | ✅ Sim | `https://biscate-ao-seven.vercel.app` |

---

## 🚫 REGRAS DE PROTEÇÃO (NÃO VIOLAR)

1. **NÃO apagar/renomear pasta `api/`** — Vercel precisa dela para serverless functions
2. **NÃO mudar imports em `api/auth/*.js`** — todos usam config inlined
3. **NÃO remover `betterAuth` import** — cada function precisa criar sua instância
4. **NÃO mudar `baseURL`** — hardcoded para production
5. **NÃO mudar cookie names** — `__Host-session_token` etc são críticos
6. **NÃO mover para `src/routes/api/`** — TanStack Start functions não funcionam igual para OAuth callbacks

---

## 📋 CHECKLIST ANTES DE QUALQUER MUDANÇA

- [ ] Criar branch nova: `git checkout -b feature/nova-feature`
- [ ] Testar login Google **antes** de mudar qualquer coisa
- [ ] Se mexer em auth: testar **todos** os fluxos (Google, GitHub, Email, Forgot, Reset)
- [ ] Deploy em **Preview** primeiro
- [ ] Só promover para Production após confirmar Preview

---

## 🔄 COMO RESTAURAR SE QUEBRAR

```bash
# Opção 1: Voltar para tag
git checkout backup-login-google-funcionando

# Opção 2: Voltar para branch
git checkout backup/login-google-working

# Opção 3: Reset hard para commit
git reset --hard cb57530
git push --force origin master
```

---

## 📝 PRÓXIMOS PASSOS SEGUROS

1. **Emails de notificação** (proposta, mensagem, lembrete 24h) — já implementados em `src/lib/email/resend.ts` e `src/lib/jobs.ts`
2. **Push notifications** — VAPID keys + Supabase Edge Functions
3. **Upload de imagens** — Supabase Storage (avatars, portfolio)
4. **OG Cards** — `src/lib/og/site.json` + Vercel OG API
5. **Dark mode** — Toggle + persist
6. **Testes E2E** — Playwright

**IMPORTANTE:** Implemente em branches separadas, teste em Preview, só merge após confirmar que login Google ainda funciona.