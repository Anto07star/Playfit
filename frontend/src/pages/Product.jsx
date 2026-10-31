import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, discount, errMsg, img, money } from '../api';
import { useCart } from '../context/CartContext';

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [cfg, setCfg] = useState({ customFee: 0 });
  const [pic, setPic] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState('');
  const [num, setNum] = useState('');
  const [toast, setToast] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setP(null); setErr(''); setPic(0); setSize(''); setQty(1); setCustom(false); setName(''); setNum('');
    api.get(`/products/${slug}`).then((r) => setP(r.data)).catch((e) => setErr(errMsg(e)));
    api.get('/orders/config').then((r) => setCfg(r.data)).catch(() => {});
  }, [slug]);

  if (err) return <div className="container page-narrow center"><h2>Jersey not found</h2><p className="muted">{err}</p><Link to="/shop" className="btn">Back to shop</Link></div>;
  if (!p) return <div className="container section muted">Loading…</div>;

  const off = discount(p);
  const useCustom = p.isCustomizable && custom && (name.trim() || num);
  const unit = p.salePrice + (useCustom ? cfg.customFee : 0);
  const soldOut = p.stock < 1;
  const pics = p.images?.length ? p.images : [null];

  const addItem = () => {
    if (!size) { setMsg('Please choose a size first.'); return false; }
    setMsg('');
    add({
      productId: p.id, slug: p.slug, name: p.name, image: p.images?.[0] || null, size, qty, price: unit,
      ...(useCustom ? { customName: name.trim().toUpperCase(), customNumber: num } : {}),
    });
    return true;
  };

  return (
    <div className="container pdp">
      <div className="gallery">
        <div className="big"><img src={img(pics[pic])} alt={p.name} /></div>
        {pics.length > 1 && (
          <div className="thumbs">
            {pics.map((s, i) => (
              <button key={i} className={i === pic ? 'on' : ''} onClick={() => setPic(i)} aria-label={`Photo ${i + 1}`}><img src={img(s)} alt="" /></button>
            ))}
          </div>
        )}
      </div>

      <div className="stack">
        <div className="muted">{p.category?.name}{p.season ? ` · ${p.season}` : ''} · {p.version}</div>
        <h1>{p.name}</h1>
        <div className="price"><b>{money(unit)}</b>{off > 0 && !useCustom && <><s>{money(p.price)}</s><em>{off}% off</em></>}</div>

        <div>
          <div className="label" style={{ marginBottom: '.4rem' }}>Size</div>
          <div className="sizes">
            {p.sizes.map((s) => <button key={s} className={'size' + (size === s ? ' on' : '')} onClick={() => setSize(s)}>{s}</button>)}
          </div>
        </div>

        {p.isCustomizable && (
          <div className="box">
            <label className="check"><input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} /> Add your name and number (+{money(cfg.customFee)})</label>
            {custom && (
              <div className="grid2" style={{ marginTop: '.8rem' }}>
                <div className="field"><label>Name (max 12 letters)</label><input className="input" maxLength={12} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MESSI" /></div>
                <div className="field"><label>Number (0–99)</label><input className="input" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="10" /></div>
              </div>
            )}
          </div>
        )}

        <div className="row">
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(Math.min(Math.min(10, p.stock), qty + 1))} aria-label="More">+</button>
          </div>
          {p.stock > 0 && p.stock <= 5 && <span className="badge warn">Only {p.stock} left</span>}
          {soldOut && <span className="badge bad">Sold out</span>}
        </div>

        {msg && <div className="alert">{msg}</div>}
        <div className="row">
          <button className="btn" disabled={soldOut} onClick={() => { if (addItem()) { setToast(true); setTimeout(() => setToast(false), 4000); } }}>Add to cart</button>
          <button className="btn btn-ghost" disabled={soldOut} onClick={() => addItem() && nav('/checkout')}>Buy now</button>
        </div>

        {p.description && <div><h3 style={{ marginBottom: '.5rem' }}>About this jersey</h3><p className="desc">{p.description}</p></div>}
      </div>
      {toast && <div className="toast">Added to cart <Link to="/cart">View cart</Link></div>}
    </div>
  );
}
