import { redirect } from "next/navigation";
import { getHardcodedAdminProfile } from "@/lib/hardcoded-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type Profile, type UserRole } from "@/types";

export async function getCurrentProfile() {
  const hardcodedProfile = await getHardcodedAdminProfile();
  if (hardcodedProfile) return hardcodedProfile;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
    role: "customer",
  };
}

export async function requireRole(roles: UserRole[] = ["admin", "seller"]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!roles.includes(profile.role)) {
    redirect("/login?message=This dashboard requires an admin or seller account.");
  }

  return profile;
}
