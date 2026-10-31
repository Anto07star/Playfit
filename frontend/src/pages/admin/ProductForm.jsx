import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errMsg, img } from '../../api';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const VERSIONS = ['Premium Quality', 'Player Version', 'Fan Version', 'Retro'];
const empty = {
  name: '', description: '', price: '', salePrice: '', stock: 10, season: '', version: 'Premium Quality',
  categoryId: '', sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: [], isCustomizable: false, isFeatured: false, isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(empty);
  const [cats, setCats] = useState([]);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data));
    if (id) {
      api.get(`/products/admin/${id}`).then((r) => {
        const p = r.data;
        setF({ ...empty, ...p, season: p.season || '', categoryId: p.categoryId ?? '', description: p.description || '' });
      }).catch((e) => setErr(errMsg(e)));
    }
  }, [id]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggleSize = (s) => setF({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : ALL_SIZES.filter((x) => f.sizes.includes(x) || x === s) });

  const addUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) return setErr('Image URL must start with http:// or https://');
    setErr(''); setF({ ...f, images: [...f.images, u] }); setUrl('');
  };
  const upload = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((x) => fd.append('files', x));
    setUp(true); setErr('');
    try {
      const { data } = await api.post('/upload', fd);
      setF((cur) => ({ ...cur, images: [...cur.images, ...data.urls] }));
    } catch (e2) { setErr(errMsg(e2)); }
    setUp(false); e.target.value = '';
  };
  const removeImg = (i) => setF({ ...f, images: f.images.filter((_, n) => n !== i) });
  const makeMain = (i) => setF({ ...f, images: [f.images[i], ...f.images.filter((_, n) => n !== i)] });

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!f.sizes.length) return setErr('Select at least one size.');
    if (Number(f.salePrice) > Number(f.price)) return setErr('Sale price cannot be higher than the original price.');
    setBusy(true);
    const body = {
      name: f.name, description: f.description, price: Number(f.price), salePrice: Number(f.salePrice), stock: parseInt(f.stock) || 0,
      season: f.season || null, version: f.version, sizes: f.sizes, images: f.images,
      isCustomizable: f.isCustomizable, isFeatured: f.isFeatured, isActive: f.isActive,
      categoryId: f.categoryId === '' ? null : Number(f.categoryId),
    };
    try {
      id ? await api.patch(`/products/${id}`, body) : await api.post('/products', body);
      nav('/admin/products');
    } catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  const tops = cats.filter((c) => !c.parentId);

  return (
    <form onSubmit={submit} style={{ maxWidth: 820 }}>
      <div className="row spread"><h2>{id ? 'Edit jersey' : 'Add jersey'}</h2><Link to="/admin/products" className="muted">Back to list</Link></div>
      {err && <div className="alert">{err}</div>}

      <div className="field"><label>Name</label><input className="input" required value={f.name} onChange={set('name')} placeholder="e.g. FC Barcelona Home Jersey 2026-27" /></div>
      <div className="field"><label>Description</label><textarea className="input" value={f.description} onChange={set('description')} /></div>

      <div className="grid3">
        <div className="field"><label>Original price (₹)</label><input className="input" type="number" min="0" step="1" required value={f.price} onChange={set('price')} /></div>
        <div className="field"><label>Selling price (₹)</label><input className="input" type="number" min="0" step="1" required value={f.salePrice} onChange={set('salePrice')} /></div>
        <div className="field"><label>Stock</label><input className="input" type="number" min="0" step="1" required value={f.stock} onChange={set('stock')} /></div>
      </div>

      <div className="grid3">
        <div className="field"><label>Category</label>
          <select className="input" value={f.categoryId} onChange={set('categoryId')}>
            <option value="">No category</option>
            {tops.map((t) => [
              <option key={t.id} value={t.id}>{t.name}</option>,
              ...cats.filter((c) => c.parentId === t.id).map((k) => <option key={k.id} value={k.id}>— {k.name}</option>),
            ])}
          </select>
        </div>
        <div className="field"><label>Season</label><input className="input" value={f.season} onChange={set('season')} placeholder="2026-27" /></div>
        <div className="field"><label>Version</label>
          <select className="input" value={f.version} onChange={set('version')}>
            {[...new Set([...VERSIONS, f.version])].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Sizes available</label>
        <div className="row">{ALL_SIZES.map((s) => <label key={s} className="check"><input type="checkbox" checked={f.sizes.includes(s)} onChange={() => toggleSize(s)} />{s}</label>)}</div>
      </div>

      <div className="field">
        <label>Photos (the first one is the main photo)</label>
        <div className="img-list">
          {f.images.map((s, i) => (
            <div className="img-item" key={s + i}>
              <img src={img(s)} alt="" />
              <div className="row">
                {i === 0 ? <span className="badge red">Main</span> : <button type="button" className="btn btn-ghost btn-sm" onClick={() => makeMain(i)}>Main</button>}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeImg(i)}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            {up ? 'Uploading…' : 'Upload photos'}
            <input type="file" accept="image/*" multiple hidden onChange={upload} disabled={up} />
          </label>
          <span className="muted">or</span>
          <input className="input" style={{ flex: 1, minWidth: 220 }} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste image URL (https://…)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={addUrl}>Add URL</button>
        </div>
      </div>

      <div className="row" style={{ gap: '1.5rem', margin: '1rem 0 1.5rem' }}>
        <label className="check"><input type="checkbox" checked={f.isCustomizable} onChange={set('isCustomizable')} /> Allow name and number printing</label>
        <label className="check"><input type="checkbox" checked={f.isFeatured} onChange={set('isFeatured')} /> Show on home page</label>
        <label className="check"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} /> Visible in store</label>
      </div>

      <button className="btn" disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Create jersey'}</button>
    </form>
  );
}
