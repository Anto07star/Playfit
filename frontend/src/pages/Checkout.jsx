import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errMsg, img, money } from '../api';
import { useCart } from '../context/CartContext';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const loadRazorpay = () =>
  new Promise((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [cfg, setCfg] = useState({ onlineEnabled: false, shippingFee: 0 });
  const [f, setF] = useState({ customerName: '', phone: '', email: '', address: '', city: '', state: 'Kerala', pincode: '' });
  const [method, setMethod] = useState('COD');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(null); // online order created but not yet paid

  useEffect(() => { api.get('/orders/config').then((r) => setCfg(r.data)).catch(() => {}); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!items.length && !pending) {
    return <div className="container page-narrow center"><h2>Nothing to check out</h2><Link to="/shop" className="btn">Shop jerseys</Link></div>;
  }

  const done = (order) => { clear(); nav('/order-success', { state: { order }, replace: true }); };

  const openRazorpay = async ({ order, razorpay }) => {
    if (!(await loadRazorpay())) { setErr('Could not load the payment window. Check your internet and try again.'); setPending({ order, razorpay }); return; }
    const rz = new window.Razorpay({
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency,
      name: 'PlayFit',
      description: `Order ${order.orderNumber}`,
      order_id: razorpay.orderId,
      prefill: { name: order.customerName, contact: order.phone, email: order.email || undefined },
      theme: { color: '#e3001b' },
      modal: { ondismiss: () => { setPending({ order, razorpay }); setBusy(false); } },
      handler: async (resp) => {
        try {
          const { data } = await api.post('/orders/verify', resp);
          done(data);
        } catch (e) { setErr(errMsg(e)); setBusy(false); }
      },
    });
    rz.on('payment.failed', (r) => { setErr(r.error?.description || 'Payment failed. You can try again.'); setPending({ order, razorpay }); setBusy(false); });
    rz.open();
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const body = {
        ...f, email: f.email || undefined, paymentMethod: method,
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty, customName: i.customName || undefined, customNumber: i.customNumber || undefined })),
      };
      const { data } = await api.post('/orders', body);
      if (method === 'COD') return done(data.order);
      await openRazorpay(data);
    } catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  const total = subtotal + (cfg.shippingFee || 0);

  return (
    <form className="container two-col" onSubmit={submit}>
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Delivery details</h2>
        {err && <div className="alert">{err}</div>}
        {pending && (
          <div className="alert">
            Your order <b>{pending.order.orderNumber}</b> is saved but not paid yet.{' '}
            <button type="button" className="btn btn-sm" onClick={() => { setBusy(true); openRazorpay(pending); }}>Pay now</button>
          </div>
        )}
        <div className="grid2">
          <div className="field"><label>Full name</label><input className="input" required value={f.customerName} onChange={set('customerName')} autoComplete="name" /></div>
          <div className="field"><label>Mobile number</label><input className="input" required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10-digit mobile number" value={f.phone} onChange={set('phone')} autoComplete="tel" /></div>
        </div>
        <div className="field"><label>Email (optional)</label><input className="input" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></div>
        <div className="field"><label>Address</label><textarea className="input" required value={f.address} onChange={set('address')} placeholder="House no, street, area" autoComplete="street-address" /></div>
        <div className="grid3">
          <div className="field"><label>City</label><input className="input" required value={f.city} onChange={set('city')} /></div>
          <div className="field"><label>State</label><select className="input" value={f.state} onChange={set('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="field"><label>Pincode</label><input className="input" required inputMode="numeric" maxLength={6} pattern="[0-9]{6}" title="6-digit pincode" value={f.pincode} onChange={set('pincode')} /></div>
        </div>

        <h3 style={{ margin: '1.2rem 0 .7rem' }}>Payment</h3>
        <label className={'pay-opt' + (method === 'COD' ? ' on' : '')}>
          <input type="radio" name="pay" checked={method === 'COD'} onChange={() => setMethod('COD')} />
          <span><b>Cash on delivery</b><br /><span className="muted">Pay in cash when the jersey arrives.</span></span>
        </label>
        {cfg.onlineEnabled && (
          <label className={'pay-opt' + (method === 'ONLINE' ? ' on' : '')}>
            <input type="radio" name="pay" checked={method === 'ONLINE'} onChange={() => setMethod('ONLINE')} />
            <span><b>Pay online</b><br /><span className="muted">UPI, cards, netbanking and wallets via Razorpay.</span></span>
          </label>
        )}
      </div>

      <div className="box">
        <h3 style={{ marginBottom: '.8rem' }}>Your order</h3>
        {items.map((i) => (
          <div key={i.key} className="row" style={{ flexWrap: 'nowrap', marginBottom: '.7rem' }}>
            <img src={img(i.image)} alt="" style={{ width: 52, height: 52, objectFit: 'cover', background: '#ecece9' }} />
            <div style={{ flex: 1, fontSize: '.88rem' }}>{i.name}<div className="muted">Size {i.size} · Qty {i.qty}{i.customName ? ` · ${i.customName} ${i.customNumber || ''}` : ''}</div></div>
            <span>{money(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="sum-row"><span>Shipping</span><span>{cfg.shippingFee ? money(cfg.shippingFee) : 'Free'}</span></div>
        <div className="sum-row total"><span>Total</span><span>{money(total)}</span></div>
        <button className="btn btn-block" disabled={busy || !items.length} style={{ marginTop: '1rem' }}>
          {busy ? 'Please wait…' : method === 'COD' ? 'Place order' : 'Pay and place order'}
        </button>
      </div>
    </form>
  );
}
