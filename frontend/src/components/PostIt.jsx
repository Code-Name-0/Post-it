import { useState, useRef, useCallback, useMemo } from 'react';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ROLE_HIERARCHY = ['guest', 'creator', 'editor', 'eraser', 'admin'];
const roleLevel = (role) => ROLE_HIERARCHY.indexOf(role || 'guest');

const POSTIT_COLORS = [
  { bg: '#FFF176', header: '#F9A825' },
  { bg: '#FFCCBC', header: '#E64A19' },
  { bg: '#C8E6C9', header: '#388E3C' },
  { bg: '#BBDEFB', header: '#1565C0' },
  { bg: '#E1BEE7', header: '#7B1FA2' },
  { bg: '#F8BBD0', header: '#C2185B' },
  { bg: '#B2EBF2', header: '#00838F' },
];
const postitColors = (id) => POSTIT_COLORS[parseInt(id?.slice(-2) || '0', 16) % POSTIT_COLORS.length];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export default function PostIt({ postit, currentUser, onMove, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(postit.text);
  const [trashHover, setTrashHover] = useState(false);
  const postitRef = useRef(null);
  const dragOffset = useRef(null);

  const { bg, header: headerBg } = useMemo(() => postitColors(postit._id), [postit._id]);

  const isAuthor = currentUser && postit.author?._id === currentUser.id;
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isAdmin || (currentUser && roleLevel(currentUser.role) >= roleLevel('editor')) || isAuthor;
  const canDelete = isAdmin || (currentUser && roleLevel(currentUser.role) >= roleLevel('eraser')) || isAuthor;
  const canMove = currentUser && (isAuthor || isAdmin) && roleLevel(currentUser.role) >= roleLevel('creator');

  const wasEdited = postit.createdAt && postit.updatedAt &&
    new Date(postit.updatedAt) - new Date(postit.createdAt) > 3000;

  const onMouseDown = useCallback((e) => {
    if (!canMove || editing || e.button !== 0) return;
    e.preventDefault();
    const rect = postitRef.current.getBoundingClientRect();
    const boardRect = postitRef.current.parentElement.getBoundingClientRect();
    dragOffset.current = {
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
      bx: boardRect.left,
      by: boardRect.top,
    };
    const onMove_ = (ev) => {
      if (!dragOffset.current || !postitRef.current) return;
      postitRef.current.style.left = `${ev.clientX - dragOffset.current.bx - dragOffset.current.dx}px`;
      postitRef.current.style.top = `${ev.clientY - dragOffset.current.by - dragOffset.current.dy}px`;
    };
    const onUp = (ev) => {
      if (!dragOffset.current) return;
      const x = ev.clientX - dragOffset.current.bx - dragOffset.current.dx;
      const y = ev.clientY - dragOffset.current.by - dragOffset.current.dy;
      dragOffset.current = null;
      onMove(postit._id, Math.max(0, Math.round(x)), Math.max(0, Math.round(y)));
      document.removeEventListener('mousemove', onMove_);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove_);
    document.addEventListener('mouseup', onUp);
  }, [canMove, editing, onMove, postit._id]);

  const onTouchStart = useCallback((e) => {
    if (!canMove || editing) return;
    const touch = e.touches[0];
    const rect = postitRef.current.getBoundingClientRect();
    const boardRect = postitRef.current.parentElement.getBoundingClientRect();
    dragOffset.current = {
      dx: touch.clientX - rect.left,
      dy: touch.clientY - rect.top,
      bx: boardRect.left,
      by: boardRect.top,
    };
    const onTouchMove_ = (ev) => {
      ev.preventDefault();
      if (!dragOffset.current || !postitRef.current) return;
      const t = ev.touches[0];
      postitRef.current.style.left = `${t.clientX - dragOffset.current.bx - dragOffset.current.dx}px`;
      postitRef.current.style.top = `${t.clientY - dragOffset.current.by - dragOffset.current.dy}px`;
    };
    const onTouchEnd_ = (ev) => {
      if (!dragOffset.current) return;
      const t = ev.changedTouches[0];
      const x = t.clientX - dragOffset.current.bx - dragOffset.current.dx;
      const y = t.clientY - dragOffset.current.by - dragOffset.current.dy;
      dragOffset.current = null;
      onMove(postit._id, Math.max(0, Math.round(x)), Math.max(0, Math.round(y)));
      postitRef.current.removeEventListener('touchmove', onTouchMove_);
      postitRef.current.removeEventListener('touchend', onTouchEnd_);
    };
    postitRef.current.addEventListener('touchmove', onTouchMove_, { passive: false });
    postitRef.current.addEventListener('touchend', onTouchEnd_);
  }, [canMove, editing, onMove, postit._id]);

  const saveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== postit.text) onEdit(postit._id, trimmed);
    else setEditText(postit.text);
    setEditing(false);
  };

  const initials = (postit.author?.username || '?')[0].toUpperCase();

  return (
    <div
      ref={postitRef}
      style={{
        ...styles.postit,
        background: bg,
        left: postit.x,
        top: postit.y,
        zIndex: postit.z_index || 1,
        cursor: canMove ? 'grab' : 'default',
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div style={{ ...styles.colorStrip, background: headerBg }} />

      <div style={styles.head}>
        <div style={{ ...styles.avatar, background: headerBg }}>
          {initials}
        </div>
        <span style={styles.authorName}>{postit.author?.username}</span>
        {canDelete && (
          <button
            style={{
              ...styles.deleteBtn,
              background: trashHover
                ? (isAdmin && !isAuthor ? '#fef2f2' : 'rgba(0,0,0,0.07)')
                : 'transparent',
              color: trashHover
                ? (isAdmin && !isAuthor ? '#dc2626' : '#64748b')
                : '#bbb',
            }}
            onClick={(e) => { e.stopPropagation(); onDelete(postit._id); }}
            onMouseEnter={() => setTrashHover(true)}
            onMouseLeave={() => setTrashHover(false)}
            title={isAdmin && !isAuthor ? `Supprimer (admin — post de ${postit.author?.username})` : 'Supprimer votre post-it'}
          >
            <TrashIcon width={13} height={13} />
          </button>
        )}
      </div>

      <div style={styles.body}>
        {editing ? (
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); }
              if (e.key === 'Escape') { setEditText(postit.text); setEditing(false); }
            }}
            style={styles.editArea}
          />
        ) : (
          <p
            style={styles.text}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (canEdit) { setEditText(postit.text); setEditing(true); }
            }}
            title={canEdit ? 'Double-clic pour modifier' : undefined}
          >
            {postit.text}
          </p>
        )}
      </div>

      <div style={styles.footer}>
        <span style={styles.date}>{formatDate(postit.createdAt)}</span>
        <div style={styles.footerRight}>
          {wasEdited && <span style={{ ...styles.badge, background: headerBg + '33', color: headerBg }}>modifié</span>}
          {canEdit && !editing && (
            <span style={styles.editHint} title="Double-clic pour éditer">
              <PencilSquareIcon width={11} height={11} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  postit: {
    position: 'absolute',
    width: 180,
    minHeight: 130,
    borderRadius: 4,
    boxShadow: '2px 4px 14px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
    touchAction: 'none',
    overflow: 'hidden',
    transition: 'box-shadow 0.15s, transform 0.1s',
  },
  colorStrip: {
    height: 4,
    flexShrink: 0,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px 4px',
    flexShrink: 0,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  authorName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#444',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    flexShrink: 0,
    transition: 'background 0.12s, color 0.12s',
    padding: 0,
  },
  body: {
    flex: 1,
    padding: '4px 10px 6px',
  },
  text: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: '#222',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    minHeight: 50,
  },
  editArea: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    resize: 'none',
    fontSize: 13,
    fontFamily: 'inherit',
    lineHeight: 1.5,
    outline: 'none',
    minHeight: 70,
    color: '#222',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 8px 6px',
    borderTop: '1px solid rgba(0,0,0,0.07)',
    flexShrink: 0,
  },
  date: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  editHint: {
    fontSize: 11,
    color: '#aaa',
    cursor: 'default',
  },
};
