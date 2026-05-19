import { createClient } from "@supabase/supabase-js";
import { env, hasAdminConfig } from "@/lib/config";

export function createSupabaseAdminClient() {
  if (!hasAdminConfig()) return null;

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
