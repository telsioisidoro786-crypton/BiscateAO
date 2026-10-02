/**
 * Provedores de identidade suportados (Supabase nativo).
 * Substitui GROK_PROVIDERS.
 */
export type AuthProvider = {
  providerId: string;     // ID interno (ex: "google", "github", "email")
  label: string;          // Label no botão
  supabaseProvider: string; // Nome no Supabase ("google", "github", "email", "phone")
};

export const AUTH_PROVIDERS = [
  { providerId: "google", label: "Google", supabaseProvider: "google" },
  { providerId: "github", label: "GitHub", supabaseProvider: "github" },
  { providerId: "email", label: "Email/Senha", supabaseProvider: "email" },
  // { providerId: "phone", label: "Telefone/SMS", supabaseProvider: "phone" },
] as const;

export type AuthProviderId = (typeof AUTH_PROVIDERS)[number]["providerId"];