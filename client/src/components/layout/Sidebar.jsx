import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineHome, HiOutlineDocumentText, HiOutlineFolderOpen,
  HiOutlineTag, HiOutlineTrash, HiOutlineCog6Tooth,
  HiOutlineMoon, HiOutlineSun, HiOutlineArrowRightOnRectangle,
  HiOutlinePlusCircle, HiOutlineSparkles, HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi2';
import { TbBrain } from 'react-icons/tb';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/notes', icon: <HiOutlineDocumentText />, label: 'Notes' },
    { path: '/collections', icon: <HiOutlineFolderOpen />, label: 'Collections' },
    { path: '/tags', icon: <HiOutlineTag />, label: 'Tags' },
    { path: '/ai', icon: <HiOutlineSparkles />, label: 'AI Assistant' },
    { path: '/trash', icon: <HiOutlineTrash />, label: 'Trash' },
  ];

  const handleNewNote = () => navigate('/notes/new');

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <TbBrain />
        </div>
        {!collapsed && <span className="sidebar__logo-text">Second Brain</span>}
      </div>

      {/* New Note Button */}
      <button className="sidebar__new-btn btn-primary" onClick={handleNewNote}>
        <HiOutlinePlusCircle />
        {!collapsed && <span>New Note</span>}
      </button>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
            end={item.path === '/'}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar__bottom">
        <button className="sidebar__action" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <NavLink to="/settings" className="sidebar__action">
          <HiOutlineCog6Tooth />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* User */}
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name}</span>
              <span className="sidebar__user-email">{user?.email}</span>
            </div>
          )}
          {!collapsed && (
            <button className="btn-icon" onClick={logout} title="Logout">
              <HiOutlineArrowRightOnRectangle />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button className="sidebar__collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
