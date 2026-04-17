import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = chargement initial en cours, null = non connecté, object = connecté
  const [user, setUser] = useState(undefined);

  // Vérifie l'état de session au chargement via le cookie HTTP-only
  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then(({ user }) => setUser(user || null))
      .catch(() => setUser(null));
  }, []);

  const login = async (username, password) => {
    const res  = await fetch('/api/login', {
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
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const loginAsGuest = async () => {
    const res  = await fetch('/api/login-as-guest', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur connexion invité');
    setUser(data.user);
    return data.user;
  };

  const signup = async (username, password) => {
    const res  = await fetch('/api/signup', {
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

  // On n'affiche rien tant que la vérification initiale n'est pas terminée
  if (user === undefined) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loginAsGuest, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
