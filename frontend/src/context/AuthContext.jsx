import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('pf_token'));
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pf_token', data.token);
    setToken(data.token);
  };
  const logout = () => {
    localStorage.removeItem('pf_token');
    setToken(null);
  };
  return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>;
}
