import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const LABELS = [
  { cls: 'auth-lc-1', title: 'Bienvenue !',    sub: 'Créez votre espace' },
  { cls: 'auth-lc-2', title: 'Rôle creator',   sub: 'Dès l\'inscription' },
  { cls: 'auth-lc-3', title: 'Temps réel',      sub: 'Socket.IO' },
  { cls: 'auth-lc-4', title: 'Sécurisé',        sub: 'Cookie HTTP-only' },
  { cls: 'auth-lc-5', title: 'Collaboratif',    sub: 'Tableaux partagés' },
  { cls: 'auth-lc-6', title: 'Gratuit',         sub: 'Sans email requis' },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 6)  { setError('Mot de passe trop court (minimum 6 caractères)'); return; }
    setLoading(true);
    try   { await signup(username.trim(), password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally     { setLoading(false); }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort'];
  const strengthColor = ['', '#ef4444', '#f97316', '#22c55e'];

  const passMatch    = confirm.length > 0 && password === confirm;
  const passMismatch = confirm.length > 0 && password !== confirm;

  return (
    <div className="auth-page">

      {/* Étiquettes style crayon */}
      {LABELS.map((l) => (
        <div key={l.cls} className={`auth-label-card ${l.cls}`}>
          <div className="auth-label-card-title">{l.title}</div>
          <div className="auth-label-card-sub">{l.sub}</div>
        </div>
      ))}

      {/* Carte formulaire */}
      <div className="auth-card">

        {/* En-tête */}
        <div className="auth-card-header">
          <div className="auth-card-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <h2 className="auth-card-title">Créer un compte</h2>
          <p className="auth-card-sub">Gratuit · Immédiat · Sans email</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nom d'utilisateur */}
          <div className="auth-field">
            <label className="auth-label">Nom d'utilisateur</label>
            <div className="auth-input-wrap">
              <span className="auth-icon"><UserIcon width={18} height={18} /></span>
              <input
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Minimum 3 caractères"
                autoFocus required minLength={3}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="auth-field">
            <label className="auth-label">Mot de passe</label>
            <div className="auth-input-wrap">
              <span className="auth-icon"><LockClosedIcon width={18} height={18} /></span>
              <input
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                style={{ paddingRight: 44 }}
                required
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? <EyeSlashIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="auth-strength">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="auth-strength-bar"
                    style={{ background: i <= strength ? strengthColor[strength] : '#e2e8f0' }} />
                ))}
                <span className="auth-strength-label" style={{ color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirmation */}
          <div className="auth-field">
            <label className="auth-label">Confirmer le mot de passe</label>
            <div className="auth-input-wrap">
              <span className="auth-icon">
                {passMatch
                  ? <CheckCircleIcon width={18} height={18} style={{ color: '#22c55e' }} />
                  : <KeyIcon         width={18} height={18} />}
              </span>
              <input
                className="auth-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                style={{
                  borderColor: passMismatch ? '#fca5a5' : passMatch ? '#86efac' : undefined,
                  boxShadow:   passMatch    ? '0 0 0 3px rgba(34,197,94,0.1)' : undefined,
                }}
                required
              />
            </div>
            {passMismatch && (
              <span className="auth-field-err">Les mots de passe ne correspondent pas</span>
            )}
          </div>

          {error && (
            <div className="auth-alert">
              <ExclamationTriangleIcon width={18} height={18} />
              {error}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading || passMismatch}>
            {loading ? 'Inscription…' : <> Créer mon compte <ArrowRightIcon width={17} height={17} /> </>}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
