import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineHeart, HiOutlineBookmark, HiOutlineTrash, HiOutlinePencilSquare, HiOutlineSparkles, HiOutlineGlobeAlt } from 'react-icons/hi2';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notesRes] = await Promise.all([
          api.get('/notes/stats'),
          api.get('/notes?limit=6&sort=-updatedAt'),
        ]);
        setStats(statsRes.data.data.stats);
        setRecentNotes(notesRes.data.data.notes);
      } catch (err) {
        toast.error('Failed to load dashboard');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { label: 'Total Notes', value: stats.totalNotes, icon: <HiOutlineDocumentText />, color: '#ff3366' },
    { label: 'Favorites', value: stats.totalFavorites, icon: <HiOutlineHeart />, color: '#00f2ff' },
    { label: 'Pinned', value: stats.totalPinned, icon: <HiOutlineBookmark />, color: '#ffaa00' },
    { label: 'Words Written', value: stats.totalWords?.toLocaleString() || 0, icon: <HiOutlinePencilSquare />, color: '#4ade80' },
  ] : [];

  const quickActions = [
    { label: 'New Note', icon: <HiOutlinePencilSquare />, action: () => navigate('/notes/new'), color: '#ff3366' },
    { label: 'AI Assistant', icon: <HiOutlineSparkles />, action: () => navigate('/ai'), color: '#7000ff' },
    { label: 'Web Clipper', icon: <HiOutlineGlobeAlt />, action: () => navigate('/ai'), color: '#00f2ff' },
    { label: 'Trash', icon: <HiOutlineTrash />, action: () => navigate('/trash'), color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__stats">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton stat-card" style={{ height: '120px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="dashboard__stats">
        {statCards.map((card, i) => (
          <motion.div className={`stat-card glass-card ${i === 0 ? 'neural-pulse' : ''}`} key={card.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-card__icon" style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
            <div className="stat-card__info">
              <span className="stat-card__value">{card.value}</span>
              <span className="stat-card__label">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__actions">
          {quickActions.map((action, i) => (
            <button key={action.label} className={`action-card glass-card ${i % 2 === 0 ? 'float' : ''}`} onClick={action.action}>
              <div className="action-card__icon" style={{ background: `${action.color}15`, color: action.color }}>{action.icon}</div>
              <span className="action-card__label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Notes */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Recent Notes</h2>
          <button className="btn-ghost" onClick={() => navigate('/notes')}>View All →</button>
        </div>
        <div className="dashboard__notes-grid">
          {recentNotes.map((note, i) => (
            <motion.div key={note._id} className="note-card glass-card" onClick={() => navigate(`/notes/${note._id}`)}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}>
              <h3 className="note-card__title">{note.title}</h3>
              <p className="note-card__preview">{note.content?.replace(/<[^>]*>/g, '').slice(0, 120) || 'No content'}</p>
              <div className="note-card__footer">
                <div className="note-card__tags">
                  {note.tags?.slice(0, 3).map((tag) => (
                    <span key={tag._id} className="badge" style={{ background: `${tag.color}20`, color: tag.color }}>{tag.name}</span>
                  ))}
                </div>
                <span className="note-card__date">{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
          {recentNotes.length === 0 && (
            <div className="dashboard__empty">
              <HiOutlineDocumentText />
              <p>No notes yet. Create your first note!</p>
              <button className="btn-primary" onClick={() => navigate('/notes/new')}>Create Note</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
