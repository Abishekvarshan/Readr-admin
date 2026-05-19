import Link from "next/link";
import { BookOpen, LayoutDashboard, LogOut, PackageCheck, Plus, ShoppingBag, Users } from "lucide-react";
import { logoutAction } from "@/server/actions";
import { type Profile } from "@/types";

export function AdminNav({ profile }: { profile: Profile }) {
  return (
    <aside className="admin-sidebar">
      <Link href="/" className="brand-lockup" aria-label="MyBook Market admin home">
        <BookOpen size={26} />
        <span>MyBook Admin</span>
      </Link>

      <nav className="nav-list" aria-label="Admin navigation">
        <Link href="/" className="nav-item">
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </Link>
        <Link href="/books" className="nav-item">
          <PackageCheck size={18} />
          <span>Saved books</span>
        </Link>
        <Link href="/books/new" className="nav-item">
          <Plus size={18} />
          <span>Add book</span>
        </Link>
        <Link href="/orders" className="nav-item">
          <ShoppingBag size={18} />
          <span>Orders</span>
        </Link>
        <Link href="/users" className="nav-item">
          <Users size={18} />
          <span>Users</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div>
          <p className="profile-name">{profile.full_name || profile.email || "Admin"}</p>
          <p className="profile-role">{profile.role}</p>
        </div>
        <form action={logoutAction}>
          <button className="icon-button" type="submit" aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </aside>
  );
}
