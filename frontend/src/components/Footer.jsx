import { Link } from 'react-router-dom';
import { Logo } from './Header';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-in">
        <div>
          <Logo />
          <p className="muted" style={{ maxWidth: '38ch', marginTop: '.8rem' }}>
            PlayFit sells football jerseys for fans who want the real match-day feel. Pick your club, pick your number, wear it with pride.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All jerseys</Link>
          <Link to="/shop?sort=price_asc">Lowest price first</Link>
          <Link to="/cart">Your cart</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/track">Track your order</Link>
          <Link to="/admin/login">Admin login</Link>
        </div>
      </div>
      <div className="container copy">© {new Date().getFullYear()} PlayFit. All rights reserved.</div>
    </footer>
  );
}
