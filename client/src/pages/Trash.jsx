import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineArrowPath } from 'react-icons/hi2';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Trash.css';

const Trash = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes/trash').then(res => { setNotes(res.data.data.notes); setLoading(false); })
      .catch(() => { toast.error('Failed to load trash'); setLoading(false); });
  }, []);

  const handleRestore = async (noteId) => {
    await api.patch(`/notes/${noteId}/restore`);
    setNotes(notes.filter(n => n._id !== noteId));
    toast.success('Note restored!');
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Permanently delete this note?')) return;
    await api.delete(`/notes/${noteId}`);
    setNotes(notes.filter(n => n._id !== noteId));
    toast.success('Permanently deleted');
  };

  return (
    <div className="trash-page">
      <p className="trash-page__info">Notes in trash are permanently deleted after 30 days.</p>
      {loading ? (
        <div>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px' }} />)}</div>
      ) : notes.length === 0 ? (
        <div className="trash-page__empty"><HiOutlineTrash /><p>Trash is empty</p></div>
      ) : (
        <div className="trash-page__list">
          <AnimatePresence>
            {notes.map(note => (
              <motion.div key={note._id} className="trash-item glass-card"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }}>
                <div className="trash-item__info">
                  <h3>{note.title}</h3>
                  <span className="trash-item__date">Deleted {new Date(note.deletedAt).toLocaleDateString()}</span>
                </div>
                <div className="trash-item__actions">
                  <button className="btn-secondary" onClick={() => handleRestore(note._id)}><HiOutlineArrowPath /> Restore</button>
                  <button className="btn-danger" onClick={() => handleDelete(note._id)}><HiOutlineTrash /> Delete</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Trash;
