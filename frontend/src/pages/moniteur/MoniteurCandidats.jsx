import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moniteurService } from '../../services/moniteurService';
import Badge from '../../components/ui/Badge';
import { toast } from 'sonner';

export default function MoniteurCandidats() {
  const queryClient = useQueryClient();

  const { data: candidats = [], isLoading } = useQuery({
    queryKey: ['mes-candidats'],
    queryFn: moniteurService.getMesCandidats,
  });

  const declarerPretMutation = useMutation({
    mutationFn: (candidat) => {
      const data = {
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.email,
        telephone: candidat.telephone,
        dateNaissance: candidat.dateNaissance,
        typePermis: candidat.typePermis,
        adresse: candidat.adresse,
        actif: candidat.actif,
        forfaitId: candidat.forfaitId,
        statutFormation: 'PRET_EXAMEN' 
      };
      return moniteurService.declarerPret(candidat.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-candidats'] });
      toast.success('Candidat déclaré prêt pour l\'examen !');
    },
    onError: (err) => toast.error(err.response?.data?.erreur || "Erreur")
  });

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement des candidats...</div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Mes candidats</h2>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Candidat</th>
              <th>Forfait</th>
              <th>Code restant</th>
              <th>Conduite restante</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {candidats.map((c) => (
              <tr key={c.id}>
                <td>{c.prenom} {c.nom}</td>
                <td>{c.forfaitNom || '—'}</td>
                <td>{c.heuresCodeRestantes} h</td>
                <td>{c.heuresConduiteRestantes} h</td>
                <td><Badge status={c.statutFormation} /></td>
                <td>
                  {c.statutFormation === 'EN_COURS' ? (
                    <button 
                      className="btn s g" 
                      onClick={() => declarerPretMutation.mutate(c)}
                      disabled={declarerPretMutation.isPending}
                    >
                      Déclarer prêt
                    </button>
                  ) : (
                    <span style={{ color: 'var(--mut)', fontSize: '12px' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {candidats.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--mut)' }}>
                  Aucun candidat trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}