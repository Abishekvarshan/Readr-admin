import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { BookForm } from "@/components/book-form";
import { requireRole } from "@/lib/auth";
import { getBook } from "@/lib/data";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireRole(["admin", "seller"]);
  const { id } = await params;
  const book = await getBook(id);

  if (!book) notFound();

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <main className="admin-main">
        <header className="page-header">
          <div>
            <h1 className="page-title">Edit book</h1>
            <p className="subtle">{book.title}</p>
          </div>
          <Link href="/books" className="button-secondary">
            <ArrowLeft size={17} />
            Saved books
          </Link>
        </header>

        <section className="panel">
          <BookForm book={book} showJsonAutofill={false} />
        </section>
      </main>
    </div>
  );
}
