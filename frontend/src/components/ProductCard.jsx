import { Link } from 'react-router-dom';
import { discount, img, money } from '../api';

export default function ProductCard({ p }) {
  const off = discount(p);
  return (
    <Link to={`/product/${p.slug}`} className="pcard">
      <div className="pimg">
        {off > 0 && <span className="badge red">-{off}%</span>}
        <img src={img(p.images?.[0])} alt={p.name} loading="lazy" />
        {p.images?.[1] && <img src={img(p.images[1])} alt="" loading="lazy" />}
        {p.stock < 1 && <div className="soldout">Sold out</div>}
      </div>
      <div className="pinfo">
        <div className="pname">{p.name}</div>
        <div className="price"><b>{money(p.salePrice)}</b>{off > 0 && <s>{money(p.price)}</s>}</div>
      </div>
    </Link>
  );
}
