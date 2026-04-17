import { Link, useNavigate } from 'react-router-dom';
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const ROLE_STYLES = {
  guest:   { bg: '#f1f5f9', text: '#64748b' },
  creator: { bg: '#dbeafe', text: '#1d4ed8' },
  editor:  { bg: '#dcfce7', text: '#15803d' },
  eraser:  { bg: '#fef9c3', text: '#a16207' },
  admin:   { bg: '#fce7f3', text: '#be185d' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.username?.[0]?.toUpperCase() || '?';
  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.guest;

  return (
    <nav style={s.nav}>

      {/* ── Logo ── */}
      <Link to="/" style={s.brand}>
        <div style={s.logoBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <span style={s.brandText}>Social Post-it</span>
      </Link>

      {/* ── Section droite ── */}
      <div style={s.right}>
        {user ? (
          <>
            {/* Admin */}
            {user.role === 'admin' && (
              <Link to="/admin" style={s.adminBtn}>
                <ShieldCheckIcon width={15} height={15} />
                <span>Administration</span>
              </Link>
            )}

            {/* Séparateur */}
            <div style={s.sep} />

            {/* Chip utilisateur */}
            <div style={s.chip}>
              <div style={s.avatar}>{initials}</div>
              <div style={s.userMeta}>
                <span style={s.username}>{user.username}</span>
                <span style={{ ...s.roleBadge, background: roleStyle.bg, color: roleStyle.text }}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Déconnexion */}
            <button onClick={handleLogout} style={s.logoutBtn} title="Se déconnecter">
              <ArrowRightOnRectangleIcon width={16} height={16} />
              <span>Déconnexion</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.loginBtn}>
              <ArrowLeftOnRectangleIcon width={15} height={15} />
              <span>Connexion</span>
            </Link>
            <Link to="/signup" style={s.signupBtn}>
              <UserPlusIcon width={15} height={15} />
              <span>Créer un compte</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    background:     '#0f172a',
    padding:        '0 28px',
    height:         60,
    flexShrink:     0,
    borderBottom:   '1px solid rgba(255,255,255,0.06)',
    boxShadow:      '0 1px 12px rgba(0,0,0,0.25)',
    zIndex:         100,
  },

  /* logo */
  brand: {
    display:        'flex',
    alignItems:     'center',
    gap:            10,
    textDecoration: 'none',
  },
  logoBox: {
    width:          32,
    height:         32,
    borderRadius:   8,
    background:     '#facc15',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  brandText: {
    fontSize:      16,
    fontWeight:    700,
    color:         '#f8fafc',
    letterSpacing: '-0.2px',
  },

  /* droite */
  right: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
  },
  sep: {
    width:      1,
    height:     24,
    background: 'rgba(255,255,255,0.1)',
    margin:     '0 6px',
  },

  /* admin */
  adminBtn: {
    display:        'flex',
    alignItems:     'center',
    gap:            6,
    background:     'rgba(250,204,21,0.12)',
    border:         '1px solid rgba(250,204,21,0.3)',
    color:          '#facc15',
    textDecoration: 'none',
    fontSize:       13,
    fontWeight:     600,
    padding:        '6px 12px',
    borderRadius:   7,
    letterSpacing:  '0.01em',
  },

  /* chip utilisateur */
  chip: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    padding:      '6px 12px 6px 6px',
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  avatar: {
    width:          34,
    height:         34,
    borderRadius:   7,
    background:     '#facc15',
    color:          '#0f172a',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     800,
    fontSize:       14,
    flexShrink:     0,
    letterSpacing:  0,
  },
  userMeta: {
    display:       'flex',
    flexDirection: 'column',
    gap:           3,
  },
  username: {
    fontSize:   13,
    fontWeight: 600,
    color:      '#f1f5f9',
    lineHeight: 1,
  },
  roleBadge: {
    fontSize:     10,
    fontWeight:   700,
    padding:      '2px 7px',
    borderRadius: 20,
    lineHeight:   1,
    width:        'fit-content',
    textTransform:'capitalize',
  },

  /* logout */
  logoutBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          6,
    background:   'transparent',
    border:       '1px solid rgba(255,255,255,0.1)',
    color:        '#94a3b8',
    borderRadius: 7,
    padding:      '6px 12px',
    cursor:       'pointer',
    fontSize:     13,
    fontWeight:   500,
  },

  /* non connecté */
  loginBtn: {
    display:        'flex',
    alignItems:     'center',
    gap:            6,
    color:          '#cbd5e1',
    textDecoration: 'none',
    fontSize:       13,
    fontWeight:     500,
    padding:        '6px 14px',
    border:         '1px solid rgba(255,255,255,0.12)',
    borderRadius:   7,
  },
  signupBtn: {
    display:        'flex',
    alignItems:     'center',
    gap:            6,
    color:          '#0f172a',
    textDecoration: 'none',
    fontSize:       13,
    fontWeight:     700,
    background:     '#facc15',
    padding:        '7px 16px',
    borderRadius:   7,
  },
};
