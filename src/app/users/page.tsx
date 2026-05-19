import { Mail, Phone, ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { requireRole } from "@/lib/auth";
import { getUsers } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "Unknown date";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function providerLabel(provider: string | null) {
  if (!provider) return "Unknown sign in";
  if (provider === "password") return "Email/password";
  if (provider === "facebook.com" || provider === "facebook") return "Facebook";
  if (provider === "google.com" || provider === "google") return "Google";
  return provider;
}

export default async function UsersPage() {
  const profile = await requireRole(["admin", "seller"]);
  const users = await getUsers();

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <main className="admin-main">
        <header className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="subtle">Review customer accounts synced from Firebase and order activity.</p>
          </div>
        </header>

        <section className="stack" aria-label="Users">
          {users.map((user) => (
            <article className="user-row panel" key={user.id}>
              <div>
                <h2 className="order-id">{user.full_name || user.email || "Unnamed user"}</h2>
                <div className="user-meta">
                  {user.email && (
                    <span className="pill">
                      <Mail size={14} /> {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="pill">
                      <Phone size={14} /> {user.phone}
                    </span>
                  )}
                  <span className="pill">
                    <ShieldCheck size={14} /> {providerLabel(user.provider)}
                  </span>
                  {user.role && <span className="pill">{user.role}</span>}
                  <span className="pill">{formatDate(user.created_at)}</span>
                </div>
              </div>

              <div>
                <p className="stat-label">Orders</p>
                <p className="stat-value" style={{ fontSize: "1.35rem" }}>{user.order_count}</p>
                <p className="subtle">{formatCurrency(user.total_spent)}</p>
              </div>
            </article>
          ))}
          {!users.length && (
            <div className="panel subtle">
              No users found. Add Supabase service role settings and make sure Firebase users sync to a profiles table.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
