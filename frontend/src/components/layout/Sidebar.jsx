import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Icons } from '../../utils/icons';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const MENUS = {
    ADMIN: [
      { path: '/admin', label: 'Tableau de bord', icon: Icons.chk },
      { path: '/admin/seances', label: 'Séances', icon: Icons.cal },
      { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: Icons.users },
      { path: '/admin/forfaits', label: 'Forfaits', icon: Icons.box },
      { path: '/admin/vehicules', label: 'Véhicules', icon: Icons.car },
      { path: '/admin/examens', label: 'Examens', icon: Icons.cap },
    ],
    MONITEUR: [
      { path: '/moniteur', label: 'Mon planning', icon: Icons.cal },
      { path: '/moniteur/candidats', label: 'Mes candidats', icon: Icons.users },
    ],
    // ✅ Ajout du menu pour les Candidats
    CANDIDAT: [
      { path: '/candidat', label: 'Mon suivi', icon: Icons.trend },
      { path: '/candidat/seances', label: 'Mes séances', icon: Icons.cal },
      { path: '/candidat/examens', label: 'Mes examens', icon: Icons.cap },
    ],
  };

  const menuItems = MENUS[user?.role] || [];

  const handleOpenProfile = () => {
    window.dispatchEvent(new CustomEvent('open-profile-modal'));
  };

  return (
    <aside className="dash-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 10px 14px', fontSize: '13px', color: 'var(--mut)' }}>
        {user?.role}
        <b style={{ display: 'block', color: 'var(--txt)', fontSize: '15px' }}>{user?.nom}</b>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                background: isActive ? 'var(--pri)' : 'transparent',
                color: isActive ? 'white' : 'var(--txt)',
                transition: 'all 0.2s',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ paddingTop: '10px', marginTop: 'auto', borderTop: '1px solid var(--bd)' }}>
        <button
          onClick={handleOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            background: 'transparent',
            color: 'var(--txt)',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--soft)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {Icons.user}
          Mon profil
        </button>
      </div>
    </aside>
  );
}