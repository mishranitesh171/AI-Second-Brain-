import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineMoon, HiOutlineSun, HiOutlineComputerDesktop } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Settings.css';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleNameChange = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      await api.put('/auth/profile', { name });
      updateUser({ name });
      toast.success('Name updated!');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="settings-page">
      <section className="settings-section glass-card">
        <h2>Profile</h2>
        <form onSubmit={handleNameChange} className="settings-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input name="name" className="input" defaultValue={user?.name} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" value={user?.email} disabled />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </section>

      <section className="settings-section glass-card">
        <h2>Appearance</h2>
        <div className="settings-themes">
          {[
            { value: 'light', icon: <HiOutlineSun />, label: 'Light' },
            { value: 'dark', icon: <HiOutlineMoon />, label: 'Dark' },
            { value: 'system', icon: <HiOutlineComputerDesktop />, label: 'System' },
          ].map(t => (
            <button key={t.value} className={`settings-theme-btn ${theme === t.value ? 'settings-theme-btn--active' : ''}`}
              onClick={() => setTheme(t.value)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section glass-card">
        <h2>API Configuration</h2>
        <p className="settings-info">Configure your API keys in the server <code>.env</code> file.</p>
        <ul className="settings-api-list">
          <li><strong>GEMINI_API_KEY</strong> — Get from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer">Google AI Studio</a></li>
          <li><strong>MONGODB_URI</strong> — Get from <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer">MongoDB Atlas</a></li>
        </ul>
      </section>

      <section className="settings-section glass-card">
        <h2>Danger Zone</h2>
        <button className="btn-danger" onClick={logout}>Logout</button>
      </section>
    </div>
  );
};

export default Settings;
