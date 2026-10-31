import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';
export const api = axios.create({ baseURL: BASE + '/api' });

api.interceptors.request.use((c) => {
  const t = localStorage.getItem('pf_token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    const p = location.pathname;
    if (e.response?.status === 401 && p.startsWith('/admin') && !p.endsWith('/login')) {
      localStorage.removeItem('pf_token');
      location.href = '/admin/login';
    }
    return Promise.reject(e);
  },
);

export const errMsg = (e) => {
  const m = e?.response?.data?.message;
  return Array.isArray(m) ? m.join('. ') : m || e?.message || 'Something went wrong';
};
export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#e9e9e7'/><path d='M140 80l-70 40 25 55 30-14v149h150V161l30 14 25-55-70-40c-10 20-30 30-60 30s-50-10-60-30z' fill='#c9c9c6'/></svg>",
  );
export const img = (s) => (!s ? PLACEHOLDER : /^(https?:|data:)/.test(s) ? s : BASE + s);
export const discount = (p) => (p.price > p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0);
