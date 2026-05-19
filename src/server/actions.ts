"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireRole } from "@/lib/auth";
import { uploadBookImage } from "@/lib/cloudinary";
import {
  clearHardcodedAdminSession,
  isHardcodedAdminLogin,
  setHardcodedAdminSession,
} from "@/lib/hardcoded-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formValue, slugify } from "@/lib/utils";
import { bookSchema, loginSchema, orderStatusSchema } from "@/lib/validations";

function parseBookOrRedirect(formData: FormData, path: string) {
  try {
    return bookSchema.parse({
      id: formValue(formData, "id"),
      title: formValue(formData, "title"),
      author: formValue(formData, "author"),
      description: formValue(formData, "description"),
      category: formValue(formData, "category"),
      condition: formValue(formData, "condition"),
      language: formValue(formData, "language"),
      price: formValue(formData, "price"),
      stock: formValue(formData, "stock"),
      imageUrl: formValue(formData, "imageUrl"),
      sellerName: formValue(formData, "sellerName"),
      featured: formValue(formData, "featured") === "on",
      isbn: formValue(formData, "isbn"),
      publishedYear: formValue(formData, "publishedYear") || undefined,
    });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues[0]?.message ?? "Check the book details."
        : "Check the book details.";
    redirect(`${path}?message=${encodeURIComponent(message)}`);
  }
}

function adminClientOrRedirect(path: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(`${path}?message=Add Supabase service role settings to .env.local and restart the dev server`);
  return admin;
}

async function resolveImageUrl(formData: FormData, title: string, currentUrl = "") {
  const file = formData.get("image") as File | null;
  const manualUrl = formValue(formData, "imageUrl");

  if (file && file.size > 0) {
    return uploadBookImage(file, title);
  }

  return manualUrl || currentUrl;
}

async function resolveImageUrlResult(formData: FormData, title: string, currentUrl = "") {
  try {
    return {
      imageUrl: await resolveImageUrl(formData, title, currentUrl),
      error: "",
    };
  } catch (error) {
    return {
      imageUrl: "",
      error: error instanceof Error ? error.message : "Image upload failed.",
    };
  }
}

export async function loginAction(formData: FormData) {
  const payload = loginSchema.parse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
  });

  if (isHardcodedAdminLogin(payload.email, payload.password)) {
    await setHardcodedAdminSession();
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?message=Add Supabase settings to .env");

  const { error } = await supabase.auth.signInWithPassword(payload);
  if (error) redirect(`/login?message=${encodeURIComponent(error.message)}`);

  const profile = await requireRole(["admin", "seller"]);
  redirect(profile.role === "admin" || profile.role === "seller" ? "/" : "/login");
}

export async function logoutAction() {
  await clearHardcodedAdminSession();
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}

export async function createBookAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  const parsed = parseBookOrRedirect(formData, "/books/new");

  const { imageUrl, error: imageError } = await resolveImageUrlResult(formData, parsed.title);
  if (imageError) redirect(`/books/new?message=${encodeURIComponent(imageError)}`);
  if (!imageUrl) redirect("/books/new?message=Paste an image URL or choose an image file.");

  const admin = adminClientOrRedirect("/books");
  const { error } = await admin.from("books").insert({
    slug: slugify(`${parsed.title}-${parsed.author}`),
    title: parsed.title,
    author: parsed.author,
    description: parsed.description,
    category: parsed.category,
    condition: parsed.condition,
    language: parsed.language,
    price: parsed.price,
    stock: parsed.stock,
    image_url: imageUrl,
    seller_name: parsed.sellerName,
    isbn: parsed.isbn || null,
    published_year: parsed.publishedYear || null,
    featured: parsed.featured,
  });

  if (error) redirect(`/books?message=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/books");
  redirect("/books?message=Book created.");
}

export async function updateBookAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  const id = formValue(formData, "id");
  const currentImageUrl = formValue(formData, "currentImageUrl");
  const parsed = parseBookOrRedirect(formData, `/books/${id}/edit`);

  const editPath = `/books/${id}/edit`;
  const { imageUrl, error: imageError } = await resolveImageUrlResult(formData, parsed.title, currentImageUrl);
  if (imageError) redirect(`${editPath}?message=${encodeURIComponent(imageError)}`);
  const admin = adminClientOrRedirect("/books");
  const { error } = await admin
    .from("books")
    .update({
      slug: slugify(`${parsed.title}-${parsed.author}`),
      title: parsed.title,
      author: parsed.author,
      description: parsed.description,
      category: parsed.category,
      condition: parsed.condition,
      language: parsed.language,
      price: parsed.price,
      stock: parsed.stock,
      image_url: imageUrl,
      seller_name: parsed.sellerName,
      isbn: parsed.isbn || null,
      published_year: parsed.publishedYear || null,
      featured: parsed.featured,
    })
    .eq("id", id);

  if (error) redirect(`/books?message=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/books");
  redirect("/books?message=Book updated.");
}

export async function deleteBookAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  const admin = adminClientOrRedirect("/books");
  const { error } = await admin.from("books").delete().eq("id", formValue(formData, "id"));
  if (error) redirect(`/books?message=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/books");
  redirect("/books?message=Book deleted.");
}

export async function updateOrderAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  const parsed = orderStatusSchema.parse({
    id: formValue(formData, "id"),
    orderStatus: formValue(formData, "orderStatus"),
    paymentStatus: formValue(formData, "paymentStatus"),
  });
  const admin = adminClientOrRedirect("/orders");

  const { error } = await admin
    .from("orders")
    .update({
      order_status: parsed.orderStatus,
      payment_status: parsed.paymentStatus,
    })
    .eq("id", parsed.id);

  if (error) redirect(`/orders?message=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/orders");
  redirect("/orders?message=Order updated.");
}
