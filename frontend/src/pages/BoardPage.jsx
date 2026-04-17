import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RectangleStackIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Board from '../components/Board';
import { useAuth } from '../context/AuthContext';

export default function BoardPage({ slug: defaultSlug }) {
  const { boardSlug } = useParams();
  const slug          = boardSlug || defaultSlug || 'default';
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [board,   setBoard]   = useState(null);
  const [boards,  setBoards]  = useState([]);
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [error,   setError]   = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setBoard(null);
    setError('');
    fetch(`/api/boards/${slug}`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setBoard)
      .catch(() => setError(`Tableau "${slug}" introuvable`));
  }, [slug]);

  useEffect(() => {
    fetch('/api/boards', { credentials: 'include' })
      .then((r) => r.json())
      .then(setBoards)
      .catch(() => {});
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ slug: newSlug, name: newName }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setBoards((prev) => [...prev, data]);
    setNewSlug('');
    setNewName('');
    setCreating(false);
    navigate(`/${data.slug}`);
  };

  return (
    <div style={styles.layout}>
      {/* ── Sidebar tableaux ── */}
      <aside style={styles.sidebar}>
        <div style={styles.sideHeader}>
          <RectangleStackIcon width={13} height={13} color="#6b7280" />
          <span style={styles.sideTitle}>Tableaux</span>
        </div>
        <ul style={styles.list}>
          {boards.map((b) => (
            <li key={b._id}>
              <button
                style={{
                  ...styles.boardBtn,
                  ...(b.slug === slug ? styles.boardBtnActive : {}),
                }}
                onClick={() => navigate(b.slug === 'default' ? '/' : `/${b.slug}`)}
              >
                <span style={{
                  ...styles.boardDot,
                  background: b.slug === slug ? '#facc15' : '#4b5563',
                }} />
                {b.name}
              </button>
            </li>
          ))}
        </ul>

        {user?.role === 'admin' && (
          <>
            {creating ? (
              <form onSubmit={handleCreateBoard} style={styles.createForm}>
                <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="slug (ex: maths)" style={styles.createInput} required />
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom affiché" style={styles.createInput} required />
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="submit" style={styles.createBtn}><CheckIcon width={13} height={13} /></button>
                  <button type="button" onClick={() => setCreating(false)} style={styles.cancelBtn}><XMarkIcon width={13} height={13} /></button>
                </div>
              </form>
            ) : (
              <button onClick={() => setCreating(true)} style={styles.newBoardBtn}>
                <PlusIcon width={13} height={13} /> Nouveau tableau
              </button>
            )}
          </>
        )}
      </aside>

      {/* ── Zone principale ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error ? (
          <div style={{ padding: 24, color: '#e53e3e' }}>{error}</div>
        ) : !board ? (
          <div style={{ padding: 24, color: '#888' }}>Chargement...</div>
        ) : (
          <Board boardId={board._id} boardName={board.name} />
        )}
      </div>
    </div>
  );
}

const styles = {
  layout:   { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: {
    width:         210,
    background:    '#111827',
    borderRight:   '1px solid rgba(255,255,255,0.06)',
    padding:       '16px 10px',
    overflowY:     'auto',
    flexShrink:    0,
    display:       'flex',
    flexDirection: 'column',
  },
  sideHeader: {
    display:     'flex',
    alignItems:  'center',
    gap:         6,
    padding:     '0 6px',
    marginBottom: 8,
  },
  sideTitle: {
    fontSize:      10,
    color:         '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight:    700,
    margin:        0,
  },
  list:  { listStyle: 'none', padding: 0, margin: '0 0 12px' },
  boardBtn: {
    width:        '100%',
    textAlign:    'left',
    background:   'transparent',
    border:       'none',
    padding:      '7px 10px',
    cursor:       'pointer',
    borderRadius: 6,
    fontSize:     13,
    color:        '#9ca3af',
    display:      'flex',
    alignItems:   'center',
    gap:          8,
  },
  boardBtnActive: {
    background: 'rgba(250,204,21,0.1)',
    color:      '#facc15',
    fontWeight: 600,
  },
  boardDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    flexShrink:   0,
  },
  createForm:  { display: 'flex', flexDirection: 'column', gap: 5, padding: '4px 2px', marginTop: 4 },
  createInput: { padding: '6px 9px', borderRadius: 6, border: '1px solid #374151', fontSize: 12, background: '#1f2937', color: '#e5e7eb', outline: 'none' },
  createBtn:   {
    flex: 1, background: '#facc15', border: 'none', borderRadius: 6,
    padding: '6px', cursor: 'pointer', color: '#111827',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn:   {
    flex: 1, background: '#374151', border: 'none', borderRadius: 6,
    padding: '6px', cursor: 'pointer', color: '#9ca3af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  newBoardBtn: {
    marginTop:      8,
    background:     'transparent',
    border:         '1px dashed #374151',
    borderRadius:   6,
    padding:        '7px 10px',
    cursor:         'pointer',
    color:          '#6b7280',
    fontSize:       12,
    width:          '100%',
    display:        'flex',
    alignItems:     'center',
    gap:            6,
  },
};
