import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({ seasons: [], versions: [] });
  const get = (k) => sp.get(k) || '';
  const page = parseInt(get('page')) || 1;

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
    api.get('/products/filters').then((r) => setFilters(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setData(null);
    const params = Object.fromEntries(sp.entries());
    api.get('/products', { params: { limit: 12, ...params } })
      .then((r) => setData(r.data))
      .catch(() => setData({ items: [], total: 0, pages: 0 }));
  }, [sp]);

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n);
  };

  const tops = cats.filter((c) => !c.parentId);
  const current = cats.find((c) => c.slug === get('category'));
  const title = get('search') ? `Results for “${get('search')}”` : current ? current.name : 'All jerseys';

  return (
    <div className="container shop">
      <aside className="filters">
        <h4>Clubs</h4>
        <a href="#all" className={!get('category') ? 'on' : ''} onClick={(e) => { e.preventDefault(); set('category', ''); }}>All jerseys</a>
        {tops.map((t) => (
          <div key={t.id}>
            <Link to={`/shop?category=${t.slug}`} className={get('category') === t.slug ? 'on' : ''}>{t.name}</Link>
            {cats.filter((c) => c.parentId === t.id).map((k) => (
              <Link key={k.id} to={`/shop?category=${k.slug}`} className={'sub' + (get('category') === k.slug ? ' on' : '')}>{k.name}</Link>
            ))}
          </div>
        ))}
        {filters.seasons.length > 0 && (<>
          <h4>Season</h4>
          <select className="input" value={get('season')} onChange={(e) => set('season', e.target.value)}>
            <option value="">All seasons</option>
            {filters.seasons.map((s) => <option key={s}>{s}</option>)}
          </select>
        </>)}
        {filters.versions.length > 0 && (<>
          <h4>Version</h4>
          <select className="input" value={get('version')} onChange={(e) => set('version', e.target.value)}>
            <option value="">All versions</option>
            {filters.versions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </>)}
        <h4>Availability</h4>
        <label className="check"><input type="checkbox" checked={get('inStock') === 'true'} onChange={(e) => set('inStock', e.target.checked ? 'true' : '')} /> In stock only</label>
      </aside>

      <section>
        <div className="section-head">
          <div>
            <h2>{title}</h2>
            {data && <span className="muted">{data.total} jersey{data.total === 1 ? '' : 's'}</span>}
          </div>
          <select className="input" style={{ width: 'auto' }} value={get('sort')} onChange={(e) => set('sort', e.target.value)} aria-label="Sort">
            <option value="">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {data === null ? <p className="muted">Loading jerseys…</p>
          : data.items.length === 0 ? <div className="empty">No jerseys match this search. Try a different club or clear the filters.</div>
          : <div className="grid-products">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}

        {data && data.pages > 1 && (
          <div className="pager">
            <button disabled={page <= 1} onClick={() => set('page', page - 1)}>‹</button>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === page ? 'on' : ''} onClick={() => set('page', n)}>{n}</button>
            ))}
            <button disabled={page >= data.pages} onClick={() => set('page', page + 1)}>›</button>
          </div>
        )}
      </section>
    </div>
  );
}
