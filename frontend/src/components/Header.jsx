import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';

export const Logo = () => (
  <Link to="/" className="logo" aria-label="PlayFit home">PLAY<i>/</i>FIT</Link>
);

export default function Header() {
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { count } = useCart();
  const nav = useNavigate();

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  const tops = cats.filter((c) => !c.parentId);
  const kids = (id) => cats.filter((c) => c.parentId === id);
  const go = () => setOpen(false);

  const submit = (e) => {
    e.preventDefault();
    nav(`/shop?search=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  return (
    <>
      <div className="promo">Cash on Delivery available · Pay online securely with Razorpay</div>
      <header className="header">
        <div className="container header-in">
          <Logo />
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <nav className={'nav' + (open ? ' open' : '')}>
            <NavLink to="/" end onClick={go}>Home</NavLink>
            <NavLink to="/shop" end onClick={go}>All jerseys</NavLink>
            {tops.map((c) => (
              <div className="dd" key={c.id}>
                <Link to={`/shop?category=${c.slug}`} onClick={go}>{c.name}</Link>
                {kids(c.id).length > 0 && (
                  <div className="dd-menu">
                    {kids(c.id).map((k) => (
                      <Link key={k.id} to={`/shop?category=${k.slug}`} onClick={go}>{k.name}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <NavLink to="/track" onClick={go}>Track order</NavLink>
          </nav>
          <form className="search" onSubmit={submit}>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jerseys" aria-label="Search jerseys" />
            <button type="submit" aria-label="Search">⌕</button>
          </form>
          <Link to="/cart" className="cart-link">Cart<span className="cart-count">{count}</span></Link>
        </div>
      </header>
    </>
  );
}
