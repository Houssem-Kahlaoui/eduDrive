import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { candidatService } from '../../services/candidatService';
import Badge from '../../components/ui/Badge';

export default function CandidatDashboard() {
  const { user } = useAuthStore();

  const { data: profil, isLoading } = useQuery({
    queryKey: ['mon-profil', user.id],
    queryFn: () => candidatService.getMonProfil(user.id),
  });

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement de votre suivi...</div>;
  if (!profil) return <div style={{ padding: '20px' }}>Profil introuvable.</div>;

  // Calcul des jours restants pour la validité du code
  const getJoursRestants = () => {
    if (!profil.dateValiditeCode) return '—';
    const diff = new Date(profil.dateValiditeCode) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) + ' jours';
  };

  // Pourcentage de progression (simulé par rapport aux heures totales, on met 20h comme base)
  const pctCode = Math.round((profil.heuresCodeRestantes / 20) * 100);
  const pctConduite = Math.round((profil.heuresConduiteRestantes / 20) * 100);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Mon suivi de formation</h2>

      {/* KPI */}
      <div className="kp">
        <div className="card">
          <b>{profil.heuresCodeRestantes} h</b>
          <span>Code restant</span>
        </div>
        <div className="card">
          <b>{profil.heuresConduiteRestantes} h</b>
          <span>Conduite restante</span>
        </div>
        <div className="card">
          <b>{getJoursRestants()}</b>
          <span>Validité du code</span>
        </div>
        <div className="card">
          <Badge status={profil.statutFormation} />
          <span style={{ display: 'block', marginTop: '8px' }}>Statut de formation</span>
        </div>
      </div>

      {/* Détails Forfait & Progression */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Forfait actuel : {profil.forfaitNom || 'Aucun'}</h3>
        
        <div>
          <p style={{ marginBottom: '4px', fontSize: '14px' }}>Heures de code</p>
          <div className="bar"><i style={{ width: `${Math.min(100, pctCode)}%` }}></i></div>
          
          <p style={{ margin: '16px 0 4px', fontSize: '14px' }}>Heures de conduite</p>
          <div className="bar"><i style={{ width: `${Math.min(100, pctConduite)}%` }}></i></div>
        </div>
      </div>
    </div>
  );
}