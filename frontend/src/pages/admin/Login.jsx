import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errMsg } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { token, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(email, password); nav('/admin', { replace: true }); }
    catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="logo" style={{ marginBottom: '.3rem' }}>PLAY<i>/</i>FIT</div>
        <p className="muted">Admin sign in</p>
        {err && <div className="alert">{err}</div>}
        <div className="field"><label>Email</label><input className="input" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label>Password</label><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="center" style={{ marginTop: '1rem' }}><Link to="/" className="muted">Back to store</Link></p>
      </form>
    </div>
  );
}
