import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg, img, money } from '../../api';

export default function AdminProducts() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');

  const load = () => api.get('/products/admin/all', { params: { search, page, limit: 15 } }).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const toggle = async (p) => { await api.patch(`/products/${p.id}`, { isActive: !p.isActive }); load(); };
  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/products/${p.id}`); load(); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <>
      <div className="row spread"><h2>Jerseys</h2><Link to="/admin/products/new" className="btn">Add jersey</Link></div>
      {err && <div className="alert">{err}</div>}
      <form className="row" style={{ marginBottom: '1rem' }} onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-ghost btn-sm">Search</button>
      </form>
      <div className="tablewrap">
        <table>
          <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Visible</th><th></th></tr></thead>
          <tbody>
            {!data && <tr><td colSpan="7" className="muted">Loading…</td></tr>}
            {data?.items.length === 0 && <tr><td colSpan="7" className="muted">No jerseys yet. Click “Add jersey” to create the first one.</td></tr>}
            {data?.items.map((p) => (
              <tr key={p.id} className="hover">
                <td><img className="th" src={img(p.images?.[0])} alt="" /></td>
                <td>{p.name}{p.isFeatured && <span className="badge red" style={{ marginLeft: '.5rem' }}>Featured</span>}</td>
                <td>{p.category?.name || '—'}</td>
                <td>{money(p.salePrice)} <s className="muted">{money(p.price)}</s></td>
                <td><span className={'badge ' + (p.stock < 1 ? 'bad' : p.stock <= 5 ? 'warn' : 'ok')}>{p.stock}</span></td>
                <td><label className="check"><input type="checkbox" checked={p.isActive} onChange={() => toggle(p)} /></label></td>
                <td><div className="row" style={{ flexWrap: 'nowrap' }}>
                  <Link to={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => del(p)}>Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.pages > 1 && (
        <div className="pager">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => <button key={n} className={n === page ? 'on' : ''} onClick={() => setPage(n)}>{n}</button>)}
        </div>
      )}
    </>
  );
}
