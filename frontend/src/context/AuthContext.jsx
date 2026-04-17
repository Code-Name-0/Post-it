import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then(({ user }) => setUser(user || null))
      .catch(() => setUser(null));
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const loginAsGuest = async () => {
    const res = await fetch(`${API_BASE_URL}/api/login-as-guest`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur connexion invité');
    setUser(data.user);
    return data.user;
  };

  const signup = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur d\'inscription');
    setUser(data.user);
    return data.user;
  };

  if (user === undefined) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loginAsGuest, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
