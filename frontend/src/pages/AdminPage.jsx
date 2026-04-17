import { useEffect, useState } from 'react';
import {
  EyeIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UsersIcon,
  CheckIcon,
  MinusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ArrowPathIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api.js';

const ROLES = ['guest', 'creator', 'editor', 'eraser', 'admin'];

const ROLE_META = {
  guest: {
    label: 'Guest',
    desc: 'Peut consulter le tableau sans aucune interaction.',
    color: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569', dot: '#94a3b8' },
    Icon: EyeIcon,
  },
  creator: {
    label: 'Creator',
    desc: 'Peut créer des post-its et les déplacer sur le tableau.',
    color: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#3b82f6' },
    Icon: PlusCircleIcon,
  },
  editor: {
    label: 'Editor',
    desc: 'Peut modifier le texte de ses post-its ou de tous si autorisé.',
    color: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e' },
    Icon: PencilIcon,
  },
  eraser: {
    label: 'Eraser',
    desc: 'Peut supprimer des post-its en plus des droits éditeur.',
    color: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', dot: '#f97316' },
    Icon: TrashIcon,
  },
  admin: {
    label: 'Admin',
    desc: 'Accès complet : gestion des rôles, tableaux et contenu.',
    color: { bg: '#fdf4ff', border: '#e9d5ff', text: '#7e22ce', dot: '#a855f7' },
    Icon: ShieldCheckIcon,
  },
};

const PERMISSIONS = [
  { label: 'Consulter les post-its', roles: ['guest', 'creator', 'editor', 'eraser', 'admin'] },
  { label: 'Créer des post-its', roles: ['creator', 'editor', 'eraser', 'admin'] },
  { label: 'Déplacer ses post-its', roles: ['creator', 'editor', 'eraser', 'admin'] },
  { label: 'Modifier le texte', roles: ['editor', 'eraser', 'admin'] },
  { label: 'Supprimer des post-its', roles: ['eraser', 'admin'] },
  { label: 'Accès au panneau admin', roles: ['admin'] },
];

const EMPTY_FORM = { username: '', password: '', role: 'creator' };

export default function AdminPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [hovered, setHovered] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/admin/users`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => { setError('Erreur de chargement des utilisateurs'); setLoading(false); });
  }, []);

  const changeRole = async (id, role) => {
    setError(''); setInfo('');
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      setInfo(`Rôle de "${data.username}" mis à jour → ${role}`);
      setTimeout(() => setInfo(''), 4000);
    } else {
      setError(data.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setUsers((prev) => [data, ...prev]);
      setForm(EMPTY_FORM);
      setShowCreate(false);
      setInfo(`Utilisateur "${data.username}" créé avec le rôle ${data.role}`);
      setTimeout(() => setInfo(''), 4000);
    } else {
      setFormError(data.error || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    setError(''); setInfo('');
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    setConfirmDelete(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setInfo('Utilisateur supprimé');
      setTimeout(() => setInfo(''), 4000);
    } else {
      setError(data.error || 'Erreur lors de la suppression');
    }
  };

  const counts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {});

  return (
    <div style={s.page}>
      <div style={s.container}>

        <div style={s.pageHeader}>
          <div style={s.pageHeaderLeft}>
            <div style={s.pageTitleRow}>
              <div style={s.pageIconBox}>
                <ShieldCheckIcon width={20} height={20} color="#7e22ce" />
              </div>
              <div>
                <h1 style={s.pageTitle}>Panneau d'administration</h1>
                <p style={s.pageSubtitle}>Gérez les rôles et les accès des utilisateurs</p>
              </div>
            </div>
          </div>
          <div style={s.statsRow}>
            {ROLES.map((r) => {
              const m = ROLE_META[r];
              const Icon = m.Icon;
              return (
                <div key={r} style={{ ...s.statChip, background: m.color.bg, border: `1.5px solid ${m.color.border}` }}>
                  <Icon width={14} height={14} color={m.color.dot} />
                  <span style={{ ...s.statCount, color: m.color.text }}>{counts[r]}</span>
                  <span style={{ ...s.statLabel, color: m.color.text }}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={s.alertErr}>
            <ExclamationCircleIcon width={16} height={16} /> {error}
          </div>
        )}
        {info && (
          <div style={s.alertOk}>
            <CheckCircleIcon width={16} height={16} /> {info}
          </div>
        )}

        <section style={s.section}>
          <h2 style={s.sectionTitle}>Niveaux de permission</h2>
          <p style={s.sectionDesc}>
            Chaque rôle hérite des permissions du niveau précédent.
            La hiérarchie est : <strong>guest → creator → editor → eraser → admin</strong>.
          </p>

          <div style={s.rolesGrid}>
            {ROLES.map((r) => {
              const m = ROLE_META[r];
              const Icon = m.Icon;
              return (
                <div key={r} style={{ ...s.roleCard, borderColor: m.color.border }}>
                  <div style={{ ...s.roleCardHeader, background: m.color.bg }}>
                    <div style={{ ...s.roleIconBox, background: m.color.bg, border: `1.5px solid ${m.color.border}` }}>
                      <Icon width={16} height={16} color={m.color.dot} />
                    </div>
                    <div>
                      <div style={{ ...s.roleCardName, color: m.color.text }}>{m.label}</div>
                    </div>
                  </div>
                  <div style={s.roleCardBody}>
                    <p style={s.roleCardDesc}>{m.desc}</p>
                    <ul style={s.permList}>
                      {PERMISSIONS.map((p) => {
                        const has = p.roles.includes(r);
                        return (
                          <li key={p.label} style={{ ...s.permItem, opacity: has ? 1 : 0.35 }}>
                            <span style={{ ...s.permIcon, color: has ? '#22c55e' : '#94a3b8' }}>
                              {has
                                ? <CheckIcon width={12} height={12} />
                                : <MinusIcon width={12} height={12} />}
                            </span>
                            <span style={s.permLabel}>{p.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={s.section}>
          <div style={s.tableHeader}>
            <div>
              <h2 style={s.sectionTitle}>Utilisateurs</h2>
              <p style={s.sectionDesc}>{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
            </div>
            <div style={s.tableHeaderRight}>
              <UsersIcon width={16} height={16} color="#94a3b8" />
              <button style={s.createBtn} onClick={() => { setShowCreate(true); setFormError(''); setForm(EMPTY_FORM); }}>
                <PlusCircleIcon width={15} height={15} />
                Créer un utilisateur
              </button>
            </div>
          </div>

          {showCreate && (
            <div style={s.modal}>
              <div style={s.modalBox}>
                <div style={s.modalHeader}>
                  <span style={s.modalTitle}>Nouvel utilisateur</span>
                  <button style={s.iconBtn} onClick={() => setShowCreate(false)}>
                    <XMarkIcon width={18} height={18} color="#94a3b8" />
                  </button>
                </div>
                <form onSubmit={handleCreate} style={s.form}>
                  {formError && (
                    <div style={s.alertErr}>
                      <ExclamationCircleIcon width={15} height={15} /> {formError}
                    </div>
                  )}
                  <label style={s.label}>Nom d'utilisateur</label>
                  <input
                    style={s.input}
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="ex: alice"
                    required
                    autoFocus
                  />
                  <label style={s.label}>Mot de passe</label>
                  <input
                    style={s.input}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 caractères"
                    required
                  />
                  <label style={s.label}>Rôle</label>
                  <select
                    style={s.select}
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_META[r].label}</option>
                    ))}
                  </select>
                  <div style={s.formActions}>
                    <button type="button" style={s.cancelBtn} onClick={() => setShowCreate(false)}>Annuler</button>
                    <button type="submit" style={s.submitBtn} disabled={creating}>
                      {creating ? 'Création…' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {confirmDelete && (
            <div style={s.modal}>
              <div style={{ ...s.modalBox, maxWidth: 380 }}>
                <div style={s.modalHeader}>
                  <span style={s.modalTitle}>Confirmer la suppression</span>
                  <button style={s.iconBtn} onClick={() => setConfirmDelete(null)}>
                    <XMarkIcon width={18} height={18} color="#94a3b8" />
                  </button>
                </div>
                <p style={{ margin: '12px 0 20px', fontSize: 14, color: '#475569' }}>
                  Supprimer l'utilisateur <strong>{confirmDelete.username}</strong> ? Cette action est irréversible.
                </p>
                <div style={s.formActions}>
                  <button style={s.cancelBtn} onClick={() => setConfirmDelete(null)}>Annuler</button>
                  <button style={s.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete._id)}>Supprimer</button>
                </div>
              </div>
            </div>
          )}

          <div style={s.tableWrap}>
            {loading ? (
              <div style={s.loadingRow}>
                <ArrowPathIcon width={18} height={18} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />
                Chargement…
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Utilisateur</th>
                    <th style={s.th}>Rôle actuel</th>
                    <th style={s.th}>Permissions</th>
                    <th style={s.th}>Modifier le rôle</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = me && u._id === me.id;
                    const m = ROLE_META[u.role] || ROLE_META.guest;
                    const RIcon = m.Icon;
                    const initials = u.username[0].toUpperCase();
                    return (
                      <tr
                        key={u._id}
                        style={{ ...s.tr, background: hovered === u._id ? '#f8fafc' : '#fff' }}
                        onMouseEnter={() => setHovered(u._id)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <td style={s.td}>
                          <div style={s.userCell}>
                            <div style={{ ...s.avatar, background: m.color.bg, color: m.color.text, border: `1.5px solid ${m.color.border}` }}>
                              {initials}
                            </div>
                            <div>
                              <div style={s.username}>{u.username}</div>
                              {isSelf && (
                                <div style={s.selfTag}>
                                  <UserCircleIcon width={10} height={10} /> Votre compte
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={s.td}>
                          <div style={{ ...s.rolePill, background: m.color.bg, border: `1.5px solid ${m.color.border}` }}>
                            <RIcon width={13} height={13} color={m.color.dot} />
                            <span style={{ color: m.color.text, fontWeight: 600, fontSize: 13 }}>{m.label}</span>
                          </div>
                        </td>

                        <td style={s.td}>
                          <div style={s.permDots}>
                            {PERMISSIONS.map((p) => {
                              const has = p.roles.includes(u.role);
                              return (
                                <div
                                  key={p.label}
                                  title={p.label}
                                  style={{ ...s.permDot, background: has ? m.color.dot : '#e2e8f0' }}
                                />
                              );
                            })}
                          </div>
                        </td>

                        <td style={s.td}>
                          {isSelf ? (
                            <div style={s.lockedCell}>
                              <LockClosedIcon width={13} height={13} color="#cbd5e1" />
                              <span style={s.lockedLabel}>Non modifiable</span>
                            </div>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => changeRole(u._id, e.target.value)}
                              style={s.select}
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{ROLE_META[r].label}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td style={s.td}>
                          {isSelf || u.username === 'guest' ? (
                            <div style={s.lockedCell}>
                              <LockClosedIcon width={13} height={13} color="#cbd5e1" />
                            </div>
                          ) : (
                            <button
                              style={s.deleteBtn}
                              title="Supprimer cet utilisateur"
                              onClick={() => setConfirmDelete(u)}
                            >
                              <TrashIcon width={14} height={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  page: { flex: 1, background: '#f8fafc', overflowY: 'auto', padding: '32px 24px' },
  container: { maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },

  pageHeader: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    border: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  pageHeaderLeft: { display: 'flex', alignItems: 'center' },
  pageTitleRow: { display: 'flex', alignItems: 'center', gap: 14 },
  pageIconBox: {
    width: 42, height: 42, borderRadius: 10,
    background: '#fdf4ff', border: '1.5px solid #e9d5ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pageTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' },
  pageSubtitle: { margin: '3px 0 0', fontSize: 13, color: '#94a3b8' },

  statsRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  statChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 20,
  },
  statCount: { fontSize: 15, fontWeight: 800 },
  statLabel: { fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },

  alertErr: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626',
    padding: '11px 16px', borderRadius: 10, fontSize: 14,
  },
  alertOk: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#15803d',
    padding: '11px 16px', borderRadius: 10, fontSize: 14,
  },

  section: { display: 'flex', flexDirection: 'column', gap: 14 },
  sectionTitle: { margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' },
  sectionDesc: { margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 },

  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
    gap: 12,
  },
  roleCard: {
    borderRadius: 10, border: '1.5px solid', overflow: 'hidden',
    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  roleCardHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  roleIconBox: {
    width: 30, height: 30, borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  roleCardName: { fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' },
  roleCardBody: { padding: '12px 14px' },
  roleCardDesc: { margin: '0 0 10px', fontSize: 12, color: '#64748b', lineHeight: 1.5 },
  permList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 },
  permItem: { display: 'flex', alignItems: 'center', gap: 6 },
  permIcon: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  permLabel: { fontSize: 11, color: '#475569', lineHeight: 1.3 },

  tableHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  tableHeaderRight: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#94a3b8',
  },
  tableWrap: {
    background: '#fff', borderRadius: 12, overflow: 'hidden',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  loadingRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: '32px', color: '#94a3b8', fontSize: 14,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '11px 16px', textAlign: 'left',
    background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0',
    fontSize: 11, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' },
  td: { padding: '13px 16px', verticalAlign: 'middle' },

  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 14, flexShrink: 0,
  },
  username: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  selfTag: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 11, color: '#7c3aed', fontWeight: 600, marginTop: 2,
  },

  rolePill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 11px', borderRadius: 20,
  },

  permDots: { display: 'flex', gap: 5, alignItems: 'center' },
  permDot: { width: 8, height: 8, borderRadius: '50%' },

  lockedCell: { display: 'flex', alignItems: 'center', gap: 6 },
  lockedLabel: { fontSize: 13, color: '#cbd5e1', fontStyle: 'italic' },

  select: {
    padding: '7px 10px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', cursor: 'pointer',
    fontSize: 13, background: '#f8fafc', color: '#0f172a',
    outline: 'none',
  },

  createBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    background: '#7e22ce', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '6px', borderRadius: 7,
    background: '#fef2f2', border: '1.5px solid #fca5a5',
    color: '#dc2626', cursor: 'pointer',
  },

  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    background: '#fff', borderRadius: 14, padding: '24px',
    width: '100%', maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: 800, color: '#0f172a' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    padding: '9px 12px', borderRadius: 8, fontSize: 14,
    border: '1.5px solid #e2e8f0', outline: 'none', color: '#0f172a',
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: {
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: '#f1f5f9', border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#475569',
  },
  submitBtn: {
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: '#7e22ce', color: '#fff', border: 'none', cursor: 'pointer',
  },
  deleteConfirmBtn: {
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer',
  },
};
