import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlusCircle, HiOutlineMagnifyingGlass, HiOutlineHeart, HiOutlineBookmark, HiOutlineTrash,
  HiOutlineViewColumns, HiOutlineListBullet, HiHeart, HiBookmark
} from 'react-icons/hi2';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = { limit: 50, sort: '-isPinned,-updatedAt' };
      if (search) params.search = search;
      if (filter === 'favorites') params.favorite = 'true';
      if (filter === 'pinned') params.pinned = 'true';
      const res = await api.get('/notes', { params });
      setNotes(res.data.data.notes);
    } catch (err) {
      toast.error('Failed to load notes');
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [search, filter]);

  const handleToggleFavorite = async (e, noteId) => {
    e.stopPropagation();
    try {
      await api.patch(`/notes/${noteId}/favorite`);
      setNotes(notes.map(n => n._id === noteId ? { ...n, isFavorite: !n.isFavorite } : n));
    } catch { toast.error('Failed'); }
  };

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    try {
      await api.patch(`/notes/${noteId}/pin`);
      setNotes(notes.map(n => n._id === noteId ? { ...n, isPinned: !n.isPinned } : n));
    } catch { toast.error('Failed'); }
  };

  const handleTrash = async (e, noteId) => {
    e.stopPropagation();
    try {
      await api.patch(`/notes/${noteId}/trash`);
      setNotes(notes.filter(n => n._id !== noteId));
      toast.success('Moved to trash');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="notes-page">
      {/* Toolbar */}
      <div className="notes-page__toolbar">
        <div className="notes-page__search">
          <HiOutlineMagnifyingGlass />
          <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="notes-page__filters">
          {['all', 'favorites', 'pinned'].map((f) => (
            <button key={f} className={`btn-secondary ${filter === f ? 'btn-secondary--active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="notes-page__view-toggle">
          <button className={`btn-icon ${viewMode === 'grid' ? 'btn-icon--active' : ''}`} onClick={() => setViewMode('grid')}><HiOutlineViewColumns /></button>
          <button className={`btn-icon ${viewMode === 'list' ? 'btn-icon--active' : ''}`} onClick={() => setViewMode('list')}><HiOutlineListBullet /></button>
        </div>
        <button className="btn-primary" onClick={() => navigate('/notes/new')}>
          <HiOutlinePlusCircle /> New Note
        </button>
      </div>

      {/* Notes Grid/List */}
      {loading ? (
        <div className={`notes-page__grid notes-page__grid--${viewMode}`}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? '200px' : '80px' }} />)}
        </div>
      ) : (
        <div className={`notes-page__grid notes-page__grid--${viewMode}`}>
          <AnimatePresence>
            {notes.map((note, i) => (
              <motion.div key={note._id} className={`note-item glass-card ${note.isPinned ? 'note-item--pinned' : ''}`}
                onClick={() => navigate(`/notes/${note._id}`)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3 }}>
                {note.isPinned && <div className="note-item__pin-badge">📌</div>}
                <h3 className="note-item__title">{note.title}</h3>
                {viewMode === 'grid' && (
                  <p className="note-item__preview">{note.content?.replace(/<[^>]*>/g, '').slice(0, 150) || 'No content'}</p>
                )}
                <div className="note-item__meta">
                  <div className="note-item__tags">
                    {note.tags?.slice(0, 3).map(tag => (
                      <span key={tag._id} className="badge" style={{ background: `${tag.color}20`, color: tag.color }}>{tag.name}</span>
                    ))}
                  </div>
                  <span className="note-item__date">{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="note-item__actions">
                  <button className="btn-icon" onClick={(e) => handleToggleFavorite(e, note._id)}
                    style={{ color: note.isFavorite ? '#ec4899' : undefined }}>
                    {note.isFavorite ? <HiHeart /> : <HiOutlineHeart />}
                  </button>
                  <button className="btn-icon" onClick={(e) => handleTogglePin(e, note._id)}
                    style={{ color: note.isPinned ? '#f59e0b' : undefined }}>
                    {note.isPinned ? <HiBookmark /> : <HiOutlineBookmark />}
                  </button>
                  <button className="btn-icon" onClick={(e) => handleTrash(e, note._id)}><HiOutlineTrash /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {notes.length === 0 && !loading && (
            <div className="notes-page__empty">
              <p>No notes found. {search ? 'Try different keywords.' : 'Create your first note!'}</p>
              <button className="btn-primary" onClick={() => navigate('/notes/new')}>Create Note</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;
