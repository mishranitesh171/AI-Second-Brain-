import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineMagnifyingGlass, HiOutlineBars3, HiOutlineXMark, HiOutlinePlus } from 'react-icons/hi2';
import { TbBrain } from 'react-icons/tb';
import './Header.css';

const Header = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/notes/new') return 'New Note';
    if (path.startsWith('/notes/')) return 'Edit Note';
    if (path === '/notes') return 'Notes';
    if (path === '/collections') return 'Collections';
    if (path === '/tags') return 'Tags';
    if (path === '/ai') return 'AI Assistant';
    if (path === '/trash') return 'Trash';
    if (path === '/settings') return 'Settings';
    return 'AI Second Brain';
  };

  return (
    <header className="header">
      {/* Mobile menu toggle */}
      <button className="header__mobile-btn btn-icon" onClick={onMobileMenuToggle}>
        {mobileMenuOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
      </button>

      {/* Mobile logo */}
      <div className="header__mobile-logo">
        <TbBrain />
      </div>

      {/* Page Title */}
      <h1 className="header__title">{getPageTitle()}</h1>

      {/* Search */}
      <form className="header__search" onSubmit={handleSearch}>
        <HiOutlineMagnifyingGlass className="header__search-icon" />
        <input
          type="text"
          className="header__search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="header__search-kbd hide-mobile">⌘K</kbd>
      </form>

      {/* Quick actions */}
      <button className="btn-primary header__new-btn" onClick={() => navigate('/notes/new')}>
        <HiOutlinePlus /> <span>New</span>
      </button>
    </header>
  );
};

export default Header;
