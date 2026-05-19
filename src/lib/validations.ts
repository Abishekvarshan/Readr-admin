import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const bookSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  author: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  condition: z.enum(["new", "like_new", "good", "fair", "acceptable"]),
  language: z.string().min(2),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sellerName: z.string().min(2),
  featured: z.boolean().default(false),
  isbn: z.string().optional(),
  publishedYear: z.coerce.number().int().min(1000).max(3000).optional(),
});

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  orderStatus: z.enum(["pending", "paid", "cancelled", "failed"]),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "failed"]),
});
