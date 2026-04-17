import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const LABELS = [
  { cls: 'auth-lc-1', title: 'Nouvelle idée', sub: 'Tableau principal' },
  { cls: 'auth-lc-2', title: 'Réunion à 14h', sub: 'Équipe produit' },
  { cls: 'auth-lc-3', title: 'Tâche terminée', sub: 'Sprint n°4' },
  { cls: 'auth-lc-4', title: 'Déploiement', sub: 'Priorité haute' },
  { cls: 'auth-lc-5', title: 'Fix bug login', sub: 'En cours…' },
  { cls: 'auth-lc-6', title: 'Brainstorming', sub: 'Ce vendredi' },
];

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingLogin(true);
    try { await login(username.trim(), password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoadingLogin(false); }
  };

  const handleGuest = async () => {
    setError('');
    setLoadingGuest(true);
    try { await loginAsGuest(); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoadingGuest(false); }
  };

  return (
    <div className="auth-page">

      {LABELS.map((l) => (
        <div key={l.cls} className={`auth-label-card ${l.cls}`}>
          <div className="auth-label-card-title">{l.title}</div>
          <div className="auth-label-card-sub">{l.sub}</div>
        </div>
      ))}

      <div className="auth-card">

        <div className="auth-card-header">
          <div className="auth-card-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <h2 className="auth-card-title">Connexion</h2>
          <p className="auth-card-sub">Accédez à votre espace collaboratif</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label className="auth-label">Identifiant</label>
            <div className="auth-input-wrap">
              <span className="auth-icon"><UserIcon width={18} height={18} /></span>
              <input
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom d'utilisateur"
                autoFocus required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Mot de passe</label>
            <div className="auth-input-wrap">
              <span className="auth-icon"><LockClosedIcon width={18} height={18} /></span>
              <input
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                style={{ paddingRight: 44 }}
                required
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? <EyeSlashIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-alert">
              <ExclamationTriangleIcon width={18} height={18} />
              {error}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loadingLogin}>
            {loadingLogin ? 'Connexion…' : <> Se connecter <ArrowRightIcon width={17} height={17} /> </>}
          </button>
        </form>

        <div className="auth-sep">
          <span className="auth-sep-line" />
          <span className="auth-sep-text">ou</span>
          <span className="auth-sep-line" />
        </div>

        <button className="auth-guest-btn" onClick={handleGuest} disabled={loadingGuest}>
          <UsersIcon width={18} height={18} />
          {loadingGuest ? 'Connexion…' : "Continuer en tant qu'invité"}
        </button>
        <p className="auth-guest-note">Accès lecture seule · Sans inscription</p>

        <p className="auth-switch">
          Pas de compte ? <Link to="/signup">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
