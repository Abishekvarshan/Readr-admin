# MyBook Market Admin

Standalone admin dashboard for the `book-market-mvp` Supabase database.

## Setup

1. Copy `.env.example` to `.env`.
2. Use the same Supabase URL and anon key as `book-market-mvp`.
3. Add `SUPABASE_SERVICE_ROLE_KEY` so the admin app can manage books and orders.
4. Add Cloudinary credentials. Uploaded book covers are stored in Cloudinary and the returned `secure_url` is saved to `books.image_url`.

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3001` by default.
