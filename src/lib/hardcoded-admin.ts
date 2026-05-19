import { cookies } from "next/headers";
import { type Profile } from "@/types";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin@2001";
const ADMIN_SESSION_COOKIE = "mybook_admin_session";
const ADMIN_SESSION_VALUE = "hardcoded-admin";

export const hardcodedAdminProfile: Profile = {
  id: "hardcoded-admin",
  full_name: "Admin",
  email: ADMIN_EMAIL,
  role: "admin",
};

export function isHardcodedAdminLogin(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export async function getHardcodedAdminProfile() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE
    ? hardcodedAdminProfile
    : null;
}

export async function setHardcodedAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearHardcodedAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
