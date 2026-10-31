import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
const KEY = 'pf_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  const add = (item) =>
    setItems((cur) => {
      const key = [item.productId, item.size, item.customName || '', item.customNumber || ''].join('|');
      const hit = cur.find((i) => i.key === key);
      if (hit) return cur.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + item.qty) } : i));
      return [...cur, { ...item, key }];
    });
  const setQty = (key, qty) => setItems((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
  const remove = (key) => setItems((c) => c.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items, add, setQty, remove, clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
