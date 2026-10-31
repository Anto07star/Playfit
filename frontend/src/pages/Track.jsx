import { useState } from 'react';
import { api, errMsg, money } from '../api';

const STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function Track() {
  const [orderNumber, setN] = useState('');
  const [phone, setP] = useState('');
  const [o, setO] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setO(null); setBusy(true);
    try { setO((await api.get('/orders/track', { params: { orderNumber, phone } })).data); }
    catch (e2) { setErr(errMsg(e2)); }
    setBusy(false);
  };
  const idx = o ? STEPS.indexOf(o.status) : -1;

  return (
    <div className="container page-narrow">
      <h1 style={{ fontSize: '3.2rem' }}>Track your order</h1>
      <p className="muted">Enter the order number from your confirmation and the mobile number you used.</p>
      <form onSubmit={submit}>
        <div className="field"><label>Order number</label><input className="input" required value={orderNumber} onChange={(e) => setN(e.target.value)} placeholder="PFXXXXXXXX" /></div>
        <div className="field"><label>Mobile number</label><input className="input" required inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setP(e.target.value)} /></div>
        <button className="btn" disabled={busy}>{busy ? 'Checking…' : 'Track'}</button>
      </form>
      {err && <div className="alert" style={{ marginTop: '1rem' }}>{err}</div>}
      {o && (
        <div className="box" style={{ marginTop: '1.5rem' }}>
          <div className="row spread"><b>{o.orderNumber}</b><span className="badge">{o.paymentMethod === 'COD' ? 'Cash on delivery' : `Online · ${o.paymentStatus}`}</span></div>
          {o.status === 'CANCELLED'
            ? <div className="alert" style={{ marginTop: '1rem' }}>This order was cancelled.</div>
            : <div className="steps">{STEPS.map((s, i) => <div key={s} className={'step' + (i <= idx ? ' done' : '')}>{s}</div>)}</div>}
          {o.items.map((i, n) => (
            <div key={n} className="sum-row"><span>{i.name} · {i.size} × {i.qty}{i.customName ? ` · ${i.customName} ${i.customNumber || ''}` : ''}</span><span>{money(i.unitPrice * i.qty)}</span></div>
          ))}
          <div className="sum-row total"><span>Total</span><span>{money(o.total)}</span></div>
        </div>
      )}
    </div>
  );
}
