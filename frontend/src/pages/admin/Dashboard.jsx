import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/orders/admin/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <p className="muted">Loading…</p>;
  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat"><b>{s.totalOrders}</b><span>Total orders</span></div>
        <div className="stat"><b>{s.pending}</b><span>New orders to confirm</span></div>
        <div className="stat"><b>{money(s.revenue)}</b><span>Order value (excl. cancelled)</span></div>
        <div className="stat"><b>{s.productCount}</b><span>Jerseys listed</span></div>
      </div>

      <div className="row spread"><h3>Recent orders</h3><Link to="/admin/orders" className="red">All orders</Link></div>
      <div className="tablewrap" style={{ margin: '.8rem 0 2rem' }}>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {s.recent.length === 0 && <tr><td colSpan="5" className="muted">No orders yet.</td></tr>}
            {s.recent.map((o) => (
              <tr key={o.id}><td>{o.orderNumber}</td><td>{o.customerName}</td><td>{money(o.total)}</td><td>{o.paymentMethod} · {o.paymentStatus}</td><td><span className="badge">{o.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Low stock (5 or fewer)</h3>
      <div className="tablewrap" style={{ marginTop: '.8rem' }}>
        <table>
          <thead><tr><th>Jersey</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {s.lowStock.length === 0 && <tr><td colSpan="3" className="muted">Nothing running low.</td></tr>}
            {s.lowStock.map((p) => (
              <tr key={p.id}><td>{p.name}</td><td><span className={'badge ' + (p.stock < 1 ? 'bad' : 'warn')}>{p.stock}</span></td><td><Link to={`/admin/products/${p.id}`} className="red">Edit</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
