import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Context } from '../main';
import '../styles/AppNavbar.css';

const AppNavbar = () => {
  const { isAuthenticated } = useContext(Context);
  const location = useLocation();
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="app-navbar">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        <span className="nav-icon">📊</span>
        <span className="nav-text">Dashboard</span>
      </Link>
      <Link to="/entries" className={location.pathname === '/entries' ? 'active' : ''}>
        <span className="nav-icon">📝</span>
        <span className="nav-text">Entries</span>
      </Link>
      <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>
        <span className="nav-icon">📈</span>
        <span className="nav-text">Analytics</span>
      </Link>
      <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
        <span className="nav-icon">👤</span>
        <span className="nav-text">Profile</span>
      </Link>
    </div>
  );
};

export default AppNavbar;