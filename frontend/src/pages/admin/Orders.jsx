import { Fragment, useEffect, useState } from 'react';
import { api, errMsg, money } from '../../api';

const STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const tone = { PLACED: 'warn', CONFIRMED: '', SHIPPED: '', DELIVERED: 'ok', CANCELLED: 'bad', PAID: 'ok', PENDING: 'warn', FAILED: 'bad' };

export default function AdminOrders() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/orders/admin/all', { params: { status, search, page } }).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, page]);

  const update = async (o, patch) => {
    try { await api.patch(`/orders/admin/${o.id}`, patch); load(); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <>
      <h2>Orders</h2>
      {err && <div className="alert">{err}</div>}
      <form className="row" style={{ marginBottom: '1rem' }} onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
        <input className="input" style={{ maxWidth: 300 }} placeholder="Order number, name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 180 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm">Search</button>
      </form>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!data && <tr><td colSpan="7" className="muted">Loading…</td></tr>}
            {data?.items.length === 0 && <tr><td colSpan="7" className="muted">No orders found.</td></tr>}
            {data?.items.map((o) => (
              <Fragment key={o.id}>
                <tr className="hover">
                  <td><b>{o.orderNumber}</b></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{o.customerName}<div className="muted">{o.phone}</div></td>
                  <td>{money(o.total)}</td>
                  <td>{o.paymentMethod}<div><span className={'badge ' + tone[o.paymentStatus]}>{o.paymentStatus}</span></div></td>
                  <td>
                    <select className="input" style={{ padding: '.35rem' }} value={o.status} onChange={(e) => update(o, { status: e.target.value })}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setOpen(open === o.id ? null : o.id)}>{open === o.id ? 'Hide' : 'Details'}</button></td>
                </tr>
                {open === o.id && (
                  <tr className="order-detail"><td colSpan="7">
                    <div className="grid2">
                      <div>
                        <b>Ship to</b>
                        <p className="muted">{o.customerName}, {o.phone}{o.email ? `, ${o.email}` : ''}<br />{o.address}<br />{o.city}, {o.state} – {o.pincode}</p>
                        {o.razorpayPaymentId && <p className="muted">Razorpay payment: {o.razorpayPaymentId}</p>}
                        {o.paymentStatus !== 'PAID' && <button className="btn btn-sm" onClick={() => update(o, { paymentStatus: 'PAID' })}>Mark as paid</button>}
                      </div>
                      <div>
                        <b>Items</b>
                        {o.items.map((i, n) => (
                          <div key={n} className="sum-row"><span>{i.name} · {i.size} × {i.qty}{i.customName || i.customNumber ? ` · print: ${i.customName || ''} ${i.customNumber || ''}` : ''}</span><span>{money(i.unitPrice * i.qty)}</span></div>
                        ))}
                        <div className="sum-row"><span>Shipping</span><span>{money(o.shipping)}</span></div>
                        <div className="sum-row"><b>Total</b><b>{money(o.total)}</b></div>
                      </div>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.pages > 1 && (
        <div className="pager">{Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => <button key={n} className={n === page ? 'on' : ''} onClick={() => setPage(n)}>{n}</button>)}</div>
      )}
    </>
  );
}
