import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { type AppUser, type Book, type Order, type UserRole } from "@/types";

export async function getBooks() {
  const admin = createSupabaseAdminClient();
  if (!admin) return [] as Book[];

  const { data, error } = await admin
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Book[]) ?? [];
}

export async function getBook(id: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return (data as Book) ?? null;
}

export async function getOrders() {
  const admin = createSupabaseAdminClient();
  if (!admin) return [] as Order[];

  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Order[]) ?? [];
}

function textValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function roleValue(value: unknown) {
  return value === "admin" || value === "seller" || value === "customer" ? value : null;
}

function dateValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function providerValue(row: Record<string, unknown>) {
  return textValue(row, [
    "provider",
    "auth_provider",
    "sign_in_provider",
    "firebase_provider",
    "login_provider",
  ]);
}

export async function getUsers() {
  const admin = createSupabaseAdminClient();
  if (!admin) return [] as AppUser[];

  const [{ data: profileRows }, { data: firebaseProfileRows }, orders] = await Promise.all([
    admin.from("profiles").select("*"),
    admin.from("firebase_profiles").select("*"),
    getOrders(),
  ]);

  const usersByEmail = new Map<string, AppUser>();

  for (const row of [
    ...((profileRows ?? []) as Record<string, unknown>[]),
    ...((firebaseProfileRows ?? []) as Record<string, unknown>[]),
  ]) {
    const email = textValue(row, ["email"]);
    const key = (email ?? textValue(row, ["id"]) ?? crypto.randomUUID()).toLowerCase();
    const existing = usersByEmail.get(key);

    const nextUser = {
      id: textValue(row, ["id", "uid", "firebase_uid"]) ?? key,
      full_name: textValue(row, ["full_name", "name", "display_name", "customer_name"]),
      email,
      phone: textValue(row, ["phone", "phone_number", "customer_phone"]),
      role: roleValue(row.role) as UserRole | null,
      provider: providerValue(row),
      created_at: dateValue(row.created_at) ?? dateValue(row.last_login_at),
      order_count: existing?.order_count ?? 0,
      total_spent: existing?.total_spent ?? 0,
    };

    usersByEmail.set(key, existing ? { ...existing, ...nextUser } : nextUser);
  }

  for (const order of orders) {
    const key = order.customer_email.toLowerCase();
    const existing = usersByEmail.get(key);

    if (existing) {
      existing.order_count += 1;
      existing.total_spent += Number(order.total_amount);
      existing.phone ||= order.customer_phone;
      existing.full_name ||= order.customer_name;
      existing.created_at ||= order.created_at ?? null;
      continue;
    }

    usersByEmail.set(key, {
      id: order.user_id ?? key,
      full_name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      role: "customer",
      provider: null,
      created_at: order.created_at ?? null,
      order_count: 1,
      total_spent: Number(order.total_amount),
    });
  }

  return Array.from(usersByEmail.values()).sort((a, b) => {
    const left = a.created_at ? Date.parse(a.created_at) : 0;
    const right = b.created_at ? Date.parse(b.created_at) : 0;
    return right - left;
  });
}
