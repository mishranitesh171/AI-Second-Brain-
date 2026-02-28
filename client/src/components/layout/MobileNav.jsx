import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineSparkles, HiOutlinePlusCircle, HiOutlineCog6Tooth } from 'react-icons/hi2';
import './MobileNav.css';

const MobileNav = () => {
  return (
    <nav className="mobile-nav">
      <NavLink to="/" className={({ isActive }) => `mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`} end>
        <HiOutlineHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/notes" className={({ isActive }) => `mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}>
        <HiOutlineDocumentText />
        <span>Notes</span>
      </NavLink>
      <NavLink to="/notes/new" className="mobile-nav__item mobile-nav__item--center">
        <div className="mobile-nav__add">
          <HiOutlinePlusCircle />
        </div>
      </NavLink>
      <NavLink to="/ai" className={({ isActive }) => `mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}>
        <HiOutlineSparkles />
        <span>AI</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}>
        <HiOutlineCog6Tooth />
        <span>More</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
