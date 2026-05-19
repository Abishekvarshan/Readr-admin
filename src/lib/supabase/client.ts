import { createBrowserClient } from "@supabase/ssr";
import { env, hasSupabaseConfig } from "@/lib/config";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
