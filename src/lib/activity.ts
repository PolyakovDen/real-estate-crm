import { createClient } from './supabase/client';

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string | null,
  entityTitle?: string | null,
  details?: Record<string, unknown> | null,
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      entity_title: entityTitle ?? null,
      details: details ?? null,
    });
  } catch {
    // Activity logging is non-critical — silently ignore failures
  }
}
