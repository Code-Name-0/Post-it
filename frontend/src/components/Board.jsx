import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api.js';
import {
  LockClosedIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  PlusIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import PostIt from './PostIt';
import { useAuth } from '../context/AuthContext';

const ROLE_HIERARCHY = ['guest', 'creator', 'editor', 'eraser', 'admin'];
const roleLevel = (role) => ROLE_HIERARCHY.indexOf(role || 'guest');

export default function Board({ boardId, boardName }) {
  const { user } = useAuth();
  const [postits, setPostits] = useState([]);
  const [pendingPos, setPendingPos] = useState(null);
  const [newText, setNewText] = useState('');
  const [error, setError] = useState('');
  const boardRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!boardId) return;
    const socket = io(API_BASE_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.emit('join:board', boardId);
    socket.on('postit:added', (p) => setPostits((prev) => [...prev, p]));
    socket.on('postit:updated', (updated) => setPostits((prev) => prev.map((p) => p._id === updated._id ? updated : p)));
    socket.on('postit:deleted', ({ _id }) => setPostits((prev) => prev.filter((p) => p._id !== _id)));
    socket.on('postit:moved', ({ _id, x, y, z_index }) =>
      setPostits((prev) => prev.map((p) => p._id === _id ? { ...p, x, y, z_index } : p))
    );
    return () => { socket.emit('leave:board', boardId); socket.disconnect(); };
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;
    fetch(`${API_BASE_URL}/api/liste/${boardId}`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setPostits)
      .catch(() => setError('Impossible de charger les post-its'));
  }, [boardId]);

  const handleDoubleClick = useCallback((e) => {
    if (!user || roleLevel(user.role) < roleLevel('creator')) return;
    if (e.target !== boardRef.current && !e.target.classList.contains('board-bg')) return;
    const rect = boardRef.current.getBoundingClientRect();
    setPendingPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setNewText('');
  }, [user]);

  const submitNewPostit = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !pendingPos) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ajouter`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ text: newText.trim(), x: pendingPos.x, y: pendingPos.y, boardId }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de l'ajout"); return; }
      setPendingPos(null);
      setNewText('');
    } catch { setError('Erreur réseau'); }
  };

  const handleMove = async (id, x, y) => {
    await fetch(`${API_BASE_URL}/api/deplacer/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ x, y }) });
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce post-it ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/effacer/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Erreur lors de la suppression');
        return;
      }
      setPostits((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError('Erreur réseau lors de la suppression');
    }
  };
  const handleEdit = async (id, text) => {
    const res = await fetch(`${API_BASE_URL}/api/modifier/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text }) });
    if (!res.ok) setError('Erreur lors de la modification');
  };

  const canCreate = user && roleLevel(user.role) >= roleLevel('creator');

  return (
    <div style={s.wrapper}>

      <div style={s.header}>
        <div style={s.headerLeft}>
          <Square2StackIcon width={18} height={18} color="#64748b" />
          <h2 style={s.title}>{boardName}</h2>
          <span style={s.badge}>{postits.length} note{postits.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={s.headerRight}>
          {!user && (
            <span style={s.hint}>
              <LockClosedIcon width={13} height={13} />
              Connectez-vous pour interagir
            </span>
          )}
          {canCreate && (
            <span style={s.hint}>
              <CursorArrowRaysIcon width={13} height={13} />
              Double-clic sur le tableau pour créer
            </span>
          )}
          {error && (
            <button style={s.errBtn} onClick={() => setError('')}>
              <ExclamationCircleIcon width={13} height={13} />
              {error}
              <XMarkIcon width={12} height={12} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={boardRef}
        className="board-bg"
        style={s.board}
        onDoubleClick={handleDoubleClick}
      >
        {postits.map((p) => (
          <PostIt key={p._id} postit={p} currentUser={user}
            onMove={handleMove} onDelete={handleDelete} onEdit={handleEdit} />
        ))}

        {pendingPos && (
          <div
            style={{
              ...s.popup,
              left: Math.min(pendingPos.x, (boardRef.current?.clientWidth || 600) - 220),
              top: Math.min(pendingPos.y, (boardRef.current?.clientHeight || 400) - 185),
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={s.popupHeader}>
              <PlusIcon width={14} height={14} color="#6366f1" />
              <span style={s.popupTitle}>Nouveau post-it</span>
              <button style={s.popupClose} onClick={() => setPendingPos(null)}>
                <XMarkIcon width={14} height={14} />
              </button>
            </div>
            <form onSubmit={submitNewPostit}>
              <textarea
                autoFocus
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setPendingPos(null); }}
                placeholder="Écrivez votre note..."
                style={s.textarea}
                rows={4}
                maxLength={500}
              />
              <div style={s.popupFooter}>
                <span style={s.charCount}>{newText.length}/500</span>
                <div style={s.popupBtns}>
                  <button type="button" onClick={() => setPendingPos(null)} style={s.btnCancel}>Annuler</button>
                  <button type="submit" style={s.btnAdd} disabled={!newText.trim()}>Ajouter</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {postits.length === 0 && !pendingPos && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              <Square2StackIcon width={32} height={32} color="#cbd5e1" />
            </div>
            <p style={s.emptyTitle}>Tableau vide</p>
            <p style={s.emptySub}>
              {canCreate ? 'Double-cliquez n\'importe où pour ajouter un post-it' : 'Aucun post-it sur ce tableau'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: 50,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
    gap: 12,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  title: { margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' },
  badge: {
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 9px',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: '#94a3b8',
  },
  errBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '4px 8px',
    cursor: 'pointer',
  },

  board: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    background: '#ffffff',
    backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)',
    backgroundSize: '24px 24px',
    cursor: 'crosshair',
  },

  empty: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#94a3b8' },
  emptySub: { margin: 0, fontSize: 13, color: '#cbd5e1', maxWidth: 260, lineHeight: 1.6 },

  popup: {
    position: 'absolute',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    zIndex: 9999,
    width: 220,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  popupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 12px 8px',
    borderBottom: '1px solid #f1f5f9',
  },
  popupTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  popupClose: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  textarea: {
    width: '100%',
    resize: 'none',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    background: '#fff',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    padding: '10px 12px',
    lineHeight: 1.6,
    boxSizing: 'border-box',
    color: '#1e293b',
  },
  popupFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px 8px',
  },
  charCount: { fontSize: 10, color: '#cbd5e1' },
  popupBtns: { display: 'flex', gap: 6 },
  btnCancel: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
  },
  btnAdd: {
    background: '#6366f1',
    border: 'none',
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 12,
    color: '#fff',
    fontWeight: 700,
  },
};
