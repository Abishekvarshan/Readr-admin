import Link from "next/link";
import { BookOpen, Edit3, Plus } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { DeleteBookButton } from "@/components/book-form";
import { requireRole } from "@/lib/auth";
import { getBooks } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole(["admin", "seller"]);
  const [books, params] = await Promise.all([getBooks(), searchParams]);
  const message = typeof params.message === "string" ? params.message : "";

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <main className="admin-main">
        <header className="page-header">
          <div>
            <h1 className="page-title">Saved books</h1>
            <p className="subtle">Review saved listings, update details, or add a new AI-assisted book.</p>
          </div>
          <Link href="/books/new" className="button-primary">
            <Plus size={17} />
            New book
          </Link>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="saved-books-grid" aria-label="Saved books">
          {books.map((book) => (
            <article className="saved-book-card" key={book.id}>
              <div className="saved-book-cover">
                {book.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.image_url} alt={book.title} className="cover-image" />
                ) : (
                  <BookOpen size={30} aria-hidden="true" />
                )}
              </div>
              <div className="saved-book-body">
                <div>
                  <h2 className="saved-book-title">{book.title}</h2>
                  <p className="subtle">by {book.author}</p>
                </div>
                <p className="subtle">
                  {formatCurrency(book.price)} · {book.stock} in stock · {book.category}
                </p>
                <div className="saved-book-actions">
                  <Link className="button-secondary" href={`/books/${book.id}/edit`}>
                    <Edit3 size={16} />
                    Edit
                  </Link>
                  <DeleteBookButton id={book.id} />
                </div>
              </div>
            </article>
          ))}
          {!books.length && <div className="panel subtle">No books found yet.</div>}
        </section>
      </main>
    </div>
  );
}
