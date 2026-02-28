import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import './Layout.css';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
