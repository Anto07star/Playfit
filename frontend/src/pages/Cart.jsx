import { Link } from 'react-router-dom';
import { img, money } from '../api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();

  if (!items.length) {
    return (
      <div className="container page-narrow center">
        <h2>Your cart is empty</h2>
        <p className="muted">Pick a jersey and it will show up here.</p>
        <Link to="/shop" className="btn">Shop jerseys</Link>
      </div>
    );
  }
  return (
    <div className="container two-col">
      <div>
        <h2>Your cart</h2>
        {items.map((i) => (
          <div className="line" key={i.key}>
            <img src={img(i.image)} alt="" />
            <div>
              <Link to={`/product/${i.slug}`} style={{ fontWeight: 500 }}>{i.name}</Link>
              <div className="muted" style={{ fontSize: '.88rem' }}>
                Size {i.size}{i.customName || i.customNumber ? ` · ${i.customName || ''} ${i.customNumber || ''}` : ''}
              </div>
              <div className="row" style={{ marginTop: '.5rem' }}>
                <div className="qty">
                  <button onClick={() => setQty(i.key, i.qty - 1)} aria-label="Less">−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.key, i.qty + 1)} aria-label="More">+</button>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => remove(i.key)}>Remove</button>
              </div>
            </div>
            <b style={{ fontFamily: 'var(--display)', fontSize: '1.3rem' }}>{money(i.price * i.qty)}</b>
          </div>
        ))}
      </div>
      <div className="box">
        <h3 style={{ marginBottom: '.8rem' }}>Order summary</h3>
        <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="sum-row muted"><span>Shipping</span><span>Calculated at checkout</span></div>
        <Link to="/checkout" className="btn btn-block" style={{ marginTop: '1rem' }}>Checkout</Link>
        <p className="muted center" style={{ fontSize: '.85rem', marginTop: '.8rem' }}>No account needed.</p>
      </div>
    </div>
  );
}
