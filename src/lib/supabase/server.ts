import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, hasSupabaseConfig } from "@/lib/config";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) return null;

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Server Actions can.
        }
      },
    },
  });
}
