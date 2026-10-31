import { useEffect, useState } from 'react';
import { api, errMsg } from '../../api';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [edit, setEdit] = useState(null); // {id, name}
  const [err, setErr] = useState('');

  const load = () => api.get('/categories').then((r) => setCats(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault(); setErr('');
    try { await api.post('/categories', { name, parentId: parentId ? Number(parentId) : null }); setName(''); load(); }
    catch (e2) { setErr(errMsg(e2)); }
  };
  const save = async () => {
    try { await api.patch(`/categories/${edit.id}`, { name: edit.name }); setEdit(null); load(); }
    catch (e2) { setErr(errMsg(e2)); }
  };
  const del = async (c) => {
    if (!confirm(`Delete "${c.name}"? Jerseys in it will become uncategorised.`)) return;
    await api.delete(`/categories/${c.id}`); load();
  };

  const tops = cats.filter((c) => !c.parentId);
  const rows = tops.flatMap((t) => [{ ...t, depth: 0 }, ...cats.filter((c) => c.parentId === t.id).map((c) => ({ ...c, depth: 1 }))]);

  return (
    <>
      <h2>Categories</h2>
      {err && <div className="alert">{err}</div>}
      <form className="row" style={{ marginBottom: '1.5rem' }} onSubmit={add}>
        <input className="input" style={{ maxWidth: 280 }} required placeholder="Category name, e.g. Barcelona" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input" style={{ maxWidth: 240 }} value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">Top level</option>
          {tops.map((t) => <option key={t.id} value={t.id}>Inside: {t.name}</option>)}
        </select>
        <button className="btn">Add category</button>
      </form>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Name</th><th>Link name</th><th></th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="3" className="muted">No categories yet. Add a top-level one such as “Football Jerseys”, then clubs inside it.</td></tr>}
            {rows.map((c) => (
              <tr key={c.id} className="hover">
                <td style={{ paddingLeft: c.depth ? '2rem' : undefined }}>
                  {edit?.id === c.id
                    ? <input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} />
                    : <>{c.depth ? '— ' : ''}{c.name}</>}
                </td>
                <td className="muted">{c.slug}</td>
                <td><div className="row" style={{ flexWrap: 'nowrap' }}>
                  {edit?.id === c.id
                    ? <><button className="btn btn-sm" onClick={save}>Save</button><button className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button></>
                    : <><button className="btn btn-ghost btn-sm" onClick={() => setEdit({ id: c.id, name: c.name })}>Rename</button><button className="btn btn-danger btn-sm" onClick={() => del(c)}>Delete</button></>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
