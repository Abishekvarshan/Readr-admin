import { Save } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { requireRole } from "@/lib/auth";
import { getOrders } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { updateOrderAction } from "@/server/actions";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole(["admin", "seller"]);
  const [orders, params] = await Promise.all([getOrders(), searchParams]);
  const message = typeof params.message === "string" ? params.message : "";

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <main className="admin-main">
        <header className="page-header">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="subtle">Review customer orders and update fulfillment/payment state.</p>
          </div>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="stack" aria-label="Orders">
          {orders.map((order) => (
            <article className="order-row" key={order.id}>
              <div className="order-topline">
                <div>
                  <p className="order-id">{order.id}</p>
                  <p className="subtle">{order.customer_name} · {order.customer_email} · {order.customer_phone}</p>
                  <p className="subtle">{order.customer_address}</p>
                </div>
                <strong>{formatCurrency(order.total_amount, order.currency)}</strong>
              </div>

              {!!order.order_items?.length && (
                <ul className="order-items">
                  {order.order_items.map((item) => (
                    <li key={item.id ?? `${order.id}-${item.title}`}>
                      {item.quantity} x {item.title} at {formatCurrency(item.unit_price, order.currency)}
                    </li>
                  ))}
                </ul>
              )}

              <form action={updateOrderAction} className="order-grid" style={{ marginTop: 14 }}>
                <input type="hidden" name="id" value={order.id} />
                <select className="field" name="orderStatus" defaultValue={order.order_status}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
                <select className="field" name="paymentStatus" defaultValue={order.payment_status}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
                <button className="button-primary wide" type="submit">
                  <Save size={17} />
                  Save order
                </button>
              </form>
            </article>
          ))}
          {!orders.length && <div className="panel subtle">No orders found yet.</div>}
        </section>
      </main>
    </div>
  );
}
