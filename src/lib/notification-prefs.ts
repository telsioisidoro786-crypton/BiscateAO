// Typed server function wrappers for account-workflows
import { getNotificationPreferencesOptional as getNotificationPreferencesOptionalFn, updateNotificationPreferencesOptional as updateNotificationPreferencesOptionalFn } from "@/lib/account-workflows";

type NotificationPrefs = {
  proposals: boolean;
  messages: boolean;
  jobUpdates: boolean;
  reminders: boolean;
  email: boolean;
};

// Use a type assertion on the function to work around TanStack Start type inference
const getPrefs = getNotificationPreferencesOptionalFn as () => Promise<{ proposals: boolean; messages: boolean; job_updates: boolean; reminders: boolean; email: boolean } | undefined>;
const savePrefs = updateNotificationPreferencesOptionalFn as (data: { data: { proposals: boolean; messages: boolean; jobUpdates: boolean; reminders: boolean; email: boolean } }) => Promise<{ ok: boolean }>;

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  const rawData = await getPrefs();
  if (rawData && typeof rawData === 'object' && rawData !== null && 'job_updates' in rawData) {
    // Convert snake_case from database to camelCase
    return {
      proposals: rawData.proposals,
      messages: rawData.messages,
      jobUpdates: (rawData as any).job_updates,
      reminders: rawData.reminders,
      email: rawData.email,
    };
  }
  return { proposals: true, messages: true, jobUpdates: true, reminders: true, email: true };
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await savePrefs({ data: {
    proposals: prefs.proposals,
    messages: prefs.messages,
    jobUpdates: prefs.jobUpdates,
    reminders: prefs.reminders,
    email: prefs.email,
  } });
}