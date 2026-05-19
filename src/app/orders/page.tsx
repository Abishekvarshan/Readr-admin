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
                  <p className="subtle">Placed by {order.customer_name}</p>
                </div>
                <strong className="order-total">{formatCurrency(order.total_amount, order.currency)}</strong>
              </div>

              <div className="order-info-grid">
                <div>
                  <p className="order-label">Contact</p>
                  <p className="order-value">{order.customer_email}</p>
                  <p className="subtle">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="order-label">Delivery address</p>
                  <p className="order-value">{order.customer_address}</p>
                </div>
              </div>

              {!!order.order_items?.length && (
                <ul className="order-items">
                  {order.order_items.map((item) => (
                    <li key={item.id ?? `${order.id}-${item.title}`}>
                      <span>{item.quantity} x {item.title}</span>
                      <strong>{formatCurrency(item.unit_price, order.currency)}</strong>
                    </li>
                  ))}
                </ul>
              )}

              <form action={updateOrderAction} className="order-grid">
                <input type="hidden" name="id" value={order.id} />
                <label>
                  <span className="order-label">Order status</span>
                  <select className="field" name="orderStatus" defaultValue={order.order_status}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <label>
                  <span className="order-label">Payment</span>
                  <select className="field" name="paymentStatus" defaultValue={order.payment_status}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <button className="button-primary order-save" type="submit">
                  <Save size={17} />
                  Save
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
