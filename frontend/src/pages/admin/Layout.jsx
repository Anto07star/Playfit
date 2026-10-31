import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { token, logout } = useAuth();
  const nav = useNavigate();
  if (!token) return <Navigate to="/admin/login" replace />;
  return (
    <div className="admin">
      <aside className="side">
        <div className="logo">PLAY<i>/</i>FIT<small>admin</small></div>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/products">Jerseys</NavLink>
        <NavLink to="/admin/categories">Categories</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <div className="grow" />
        <Link to="/">View store</Link>
        <button className="lnk" onClick={() => { logout(); nav('/admin/login'); }}>Sign out</button>
      </aside>
      <div className="admin-main"><Outlet /></div>
    </div>
  );
}
