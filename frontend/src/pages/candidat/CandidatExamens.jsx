import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { candidatService } from '../../services/candidatService';
import Badge from '../../components/ui/Badge';

export default function CandidatExamens() {
  const { user } = useAuthStore();

  const { data: examens = [], isLoading } = useQuery({
    queryKey: ['mes-examens', user.id],
    queryFn: () => candidatService.getMesExamens(user.id),
  });

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Mes examens</h2>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Tentative</th>
              <th>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {examens.map((e) => (
              <tr key={e.id}>
                <td>{e.type}</td>
                <td>{e.dateExamen}</td>
                <td>{e.heure}</td>
                <td>N° {e.numeroTentative}</td>
                <td><Badge status={e.resultat} /></td>
              </tr>
            ))}
            {examens.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Aucun examen planifié.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}