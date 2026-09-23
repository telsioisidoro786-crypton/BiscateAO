import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL ?? "http://localhost:8080",
});

export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";

export const AUTH_PROVIDERS = [
  { providerId: "google", label: "Google" },
  { providerId: "github", label: "GitHub" },
  { providerId: "email", label: "Email/Senha" },
] as const;

export async function signIn(
  providerId: string,
  opts: { callbackURL?: string; errorCallbackURL?: string } = {},
): Promise<void> {
  const callbackURL = opts.callbackURL ?? "/";
  const errorCallbackURL = opts.errorCallbackURL ?? "/";

  const { data, error } = await authClient.signIn.oauth2({
    providerId,
    callbackURL,
    errorCallbackURL,
  });
  if (error) throw new Error(error.message ?? "Sign-in failed");
  if (data?.url) window.location.href = data.url;
}

export async function signInEmail(email: string, password: string) {
  const { error } = await authClient.signIn.email({ email, password });
  if (error) throw new Error(error.message ?? "Sign-in failed");
}

export async function signUpEmail(email: string, password: string, name?: string) {
  const { error } = await authClient.signUp.email({ email, password, name });
  if (error) throw new Error(error.message ?? "Sign-up failed");
}

export async function signOut(redirectTo = "/"): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? "Sign-out failed");
  window.location.href = redirectTo;
}

export { AUTH_PROVIDERS as GROK_PROVIDERS }; // compatibilidade