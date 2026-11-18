// src/components/layout/Header.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo_complet from '../../assets/logo_complet.png'; 
import { Icons } from '../../utils/icons';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ed-theme') || 'light');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ed-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'MONITEUR') return '/moniteur';
    return '/candidat';
  };

  return (
    <header className="header">
      <div className="w">
        <Link to={getDashboardPath()} style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo_complet} alt="EduDrive Logo" className="logo" />
        </Link>

        <nav className="nav">
          {!user ? (
            <>
              <a href="#forfaits" onClick={(e) => handleNavClick(e, 'forfaits')}>Forfaits</a>
              <a href="#fonctionnalites" onClick={(e) => handleNavClick(e, 'fonctionnalites')}>Fonctionnalités</a>
              <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')}>FAQ</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
              <Link to="/login" className="btn o">Se connecter</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn o" style={{ borderColor: 'var(--ko)', color: 'var(--ko)' }}>
              Déconnexion
            </button>
          )}
        </nav>

        <button id="th" className="btn o" onClick={toggleTheme} aria-label="Changer de thème">
          {theme === 'dark' ? Icons.sun : Icons.moon}
        </button>
      </div>
    </header>
  );
}