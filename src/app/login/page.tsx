import { BookOpen } from "lucide-react";
import { loginAction } from "@/server/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";

  return (
    <main className="login-page">
      <section className="login-panel">
        <BookOpen size={34} color="var(--primary)" />
        <h1 className="page-title" style={{ marginTop: 14 }}>Admin sign in</h1>
        <p className="subtle">Sign in with the configured admin account.</p>
        {message && <p className="message">{message}</p>}
        <form action={loginAction} className="login-form">
          <input className="field" name="email" type="email" placeholder="Email" defaultValue="admin@gmail.com" required />
          <input className="field" name="password" type="password" placeholder="Password" defaultValue="admin@2001" required />
          <button className="button-primary" type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
