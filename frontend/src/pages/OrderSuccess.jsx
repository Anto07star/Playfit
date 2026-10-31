import { Link, useLocation } from 'react-router-dom';
import { money } from '../api';

export default function OrderSuccess() {
  const { state } = useLocation();
  const o = state?.order;
  if (!o) return <div className="container page-narrow center"><h2>No recent order</h2><Link to="/track" className="btn">Track an order</Link></div>;
  return (
    <div className="container page-narrow">
      <h1 style={{ fontSize: '3.4rem' }}>Order <span className="red">placed</span></h1>
      <p className="muted">Thanks {o.customerName}. Keep your order number to track the delivery.</p>
      <div className="box stack">
        <div className="sum-row"><span className="muted">Order number</span><b>{o.orderNumber}</b></div>
        <div className="sum-row"><span className="muted">Total</span><b>{money(o.total)}</b></div>
        <div className="sum-row"><span className="muted">Payment</span><b>{o.paymentMethod === 'COD' ? 'Cash on delivery' : o.paymentStatus === 'PAID' ? 'Paid online' : 'Online (pending)'}</b></div>
        <div className="sum-row"><span className="muted">Deliver to</span><span style={{ textAlign: 'right' }}>{o.address}, {o.city}, {o.state} {o.pincode}</span></div>
      </div>
      <div className="row" style={{ marginTop: '1.5rem' }}>
        <Link to="/track" className="btn">Track order</Link>
        <Link to="/shop" className="btn btn-ghost">Keep shopping</Link>
      </div>
    </div>
  );
}
