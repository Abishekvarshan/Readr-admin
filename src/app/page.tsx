import Link from "next/link";
import { BookOpen, CircleDollarSign, PackageCheck, ShoppingBag, Users } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { StatCard } from "@/components/stat-card";
import { requireRole } from "@/lib/auth";
import { getBooks, getOrders, getUsers } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function AdminHome() {
  const profile = await requireRole(["admin", "seller"]);
  const [books, orders, users] = await Promise.all([getBooks(), getOrders(), getUsers()]);
  const revenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + Number(order.total_amount), 0);
  const lowStock = books.filter((book) => book.stock <= 3).length;

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <main className="admin-main">
        <header className="page-header">
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="subtle">Manage listings, Cloudinary cover images, and customer orders.</p>
          </div>
          <Link href="/books/new" className="button-primary">
            <BookOpen size={17} />
            Add book
          </Link>
        </header>

        <section className="grid-3" aria-label="Dashboard statistics">
          <StatCard label="Books" value={books.length} icon={PackageCheck} />
          <StatCard label="Orders" value={orders.length} icon={ShoppingBag} />
          <StatCard label="Users" value={users.length} icon={Users} />
          <StatCard label="Paid revenue" value={formatCurrency(revenue)} icon={CircleDollarSign} />
        </section>

        <section className="panel stack" style={{ marginTop: 18 }}>
          <div>
            <h2 className="page-title" style={{ fontSize: "1.25rem" }}>Attention</h2>
            <p className="subtle">{lowStock} books have 3 or fewer items in stock.</p>
          </div>
          <Link href="/books" className="button-secondary">Review inventory</Link>
        </section>
      </main>
    </div>
  );
}
