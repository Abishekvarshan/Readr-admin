import { Save, Trash2 } from "lucide-react";
import { BookImagePreview } from "@/components/book-image-preview";
import { BookJsonAutofill } from "@/components/book-json-autofill";
import { createBookAction, deleteBookAction, updateBookAction } from "@/server/actions";
import { type Book, type BookCondition } from "@/types";

const conditions: { value: BookCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "acceptable", label: "Acceptable" },
];

export function BookForm({ book, showJsonAutofill = !book }: { book?: Book; showJsonAutofill?: boolean }) {
  const action = book ? updateBookAction : createBookAction;

  return (
    <form action={action} className="book-form">
      {book && (
        <>
          <input type="hidden" name="id" value={book.id} />
          <input type="hidden" name="currentImageUrl" value={book.image_url} />
        </>
      )}

      <BookImagePreview initialUrl={book?.image_url ?? ""} title={book?.title ?? "Book cover"} />

      <div className="form-grid">
        {showJsonAutofill && <BookJsonAutofill />}
        <input className="field" name="title" placeholder="Title" defaultValue={book?.title} required />
        <input className="field" name="author" placeholder="Author" defaultValue={book?.author} required />
        <input className="field" name="category" placeholder="Category" defaultValue={book?.category} required />
        <select className="field" name="condition" defaultValue={book?.condition ?? "good"}>
          {conditions.map((condition) => (
            <option key={condition.value} value={condition.value}>
              {condition.label}
            </option>
          ))}
        </select>
        <input className="field" name="language" placeholder="Language" defaultValue={book?.language ?? "English"} />
        <input className="field" name="sellerName" placeholder="Seller name" defaultValue={book?.seller_name} required />
        <input className="field" type="number" step="0.01" name="price" placeholder="Price" defaultValue={book?.price} required />
        <input className="field" type="number" name="stock" placeholder="Stock" defaultValue={book?.stock} required />
        <input className="field" name="isbn" placeholder="ISBN" defaultValue={book?.isbn ?? ""} />
        <input className="field" type="number" name="publishedYear" placeholder="Published year" defaultValue={book?.published_year ?? ""} />
        <input className="field wide" name="imageUrl" placeholder="Paste image URL, or choose a file below" defaultValue={book?.image_url ?? ""} />
        <input className="field wide" type="file" name="image" accept="image/*" />
        <textarea className="field textarea wide" name="description" placeholder="Description" defaultValue={book?.description} required />
        <label className="check-row wide">
          <input type="checkbox" name="featured" defaultChecked={book?.featured} />
          Featured in the storefront
        </label>
        <button className="button-primary wide" type="submit">
          <Save size={17} />
          {book ? "Save book" : "Create book"}
        </button>
      </div>
    </form>
  );
}

export function DeleteBookButton({ id }: { id: string }) {
  return (
    <form action={deleteBookAction}>
      <input type="hidden" name="id" value={id} />
      <button className="button-danger" type="submit">
        <Trash2 size={16} />
        Delete
      </button>
    </form>
  );
}
