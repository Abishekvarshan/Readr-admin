import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { BookForm } from "@/components/book-form";
import { requireRole } from "@/lib/auth";

export default async function NewBookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole(["admin", "seller"]);
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <main className="admin-main">
        <header className="page-header">
          <div>
            <h1 className="page-title">New book</h1>
            <p className="subtle">Generate details with AI, review the form, then save the listing.</p>
          </div>
          <Link href="/books" className="button-secondary">
            <ArrowLeft size={17} />
            Saved books
          </Link>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="panel">
          <BookForm />
        </section>
      </main>
    </div>
  );
}
