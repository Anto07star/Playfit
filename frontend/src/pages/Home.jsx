import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState(true);

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data.filter((c) => !c.parentId))).catch(() => {});
    api.get('/products', { params: { featured: true, limit: 8 } })
      .then(async (r) => {
        if (r.data.items.length) return setItems(r.data.items);
        setFeatured(false);
        const l = await api.get('/products', { params: { limit: 8 } });
        setItems(l.data.items);
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-in">
          <div>
            <h1>Wear the badge.<span>Play the game.</span></h1>
            <p>Club and country jerseys with your own name and number. Pay on delivery or online, no account needed.</p>
            <div className="row">
              <Link to="/shop" className="btn">Shop jerseys</Link>
              <Link to="/track" className="btn btn-ghost">Track an order</Link>
            </div>
          </div>
          <div aria-hidden="true">
            <div className="hero-num">10</div>
            <div className="hero-tag">YOUR NAME. YOUR NUMBER.</div>
          </div>
        </div>
      </section>

      <div className="container perks">
        <div className="perk"><b>Cash on delivery</b><span>Pay when it reaches you</span></div>
        <div className="perk"><b>Secure online pay</b><span>UPI, cards and netbanking</span></div>
        <div className="perk"><b>Custom name and number</b><span>Printed on selected jerseys</span></div>
        <div className="perk"><b>Order tracking</b><span>With just your order number</span></div>
      </div>

      {cats.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head"><h2>Shop by club</h2></div>
            <div className="cats">
              {cats.map((c) => <Link key={c.id} className="cat-tile" to={`/shop?category=${c.slug}`}>{c.name}</Link>)}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: cats.length ? 0 : undefined }}>
        <div className="container">
          <div className="section-head">
            <h2>{featured ? 'Featured jerseys' : 'Latest jerseys'}</h2>
            <Link to="/shop" className="red">View all</Link>
          </div>
          {items === null ? <p className="muted">Loading jerseys…</p>
            : items.length === 0 ? <div className="empty">No jerseys yet. The shop owner can add the first one from the admin panel.</div>
            : <div className="grid-products">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
        </div>
      </section>
    </>
  );
}
