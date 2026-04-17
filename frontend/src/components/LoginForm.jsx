import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Formulaire de connexion réutilisable.
 * Utilisé dans la Navbar pour une connexion inline.
 */
export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      setUsername('');
      setPassword('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Identifiant"
        style={styles.input}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        style={styles.input}
        required
      />
      <button type="submit" style={styles.btn}>Connexion</button>
      {error && <span style={styles.error}>{error}</span>}
    </form>
  );
}

const styles = {
  form:  { display: 'flex', alignItems: 'center', gap: 6 },
  input: { padding: '4px 8px', borderRadius: 4, border: 'none', fontSize: 13, height: 30 },
  btn:   { padding: '4px 12px', borderRadius: 4, background: '#FFEB3B', border: 'none', cursor: 'pointer', fontWeight: 'bold', height: 30 },
  error: { color: '#ff6b6b', fontSize: 12 },
};
