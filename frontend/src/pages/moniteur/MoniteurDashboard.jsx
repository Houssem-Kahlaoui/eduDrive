import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { moniteurService } from '../../services/moniteurService';
import { utilisateurService } from '../../services/utilisateurService'; 
import { vehiculeService } from '../../services/vehiculeService'; 
import Calendar from '../../components/ui/Calendar';
import Badge from '../../components/ui/Badge';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useState } from 'react';

export default function MoniteurDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedSeance, setSelectedSeance] = useState(null);

  const { data: seances = [], isLoading } = useQuery({
    queryKey: ['mes-seances', user.id],
    queryFn: () => moniteurService.getMesSeances(user.id),
  });

  const { data: candidats = [] } = useQuery({
    queryKey: ['candidats'],
    queryFn: utilisateurService.getCandidats,
  });

  const { data: vehicules = [] } = useQuery({
    queryKey: ['vehicules'],
    queryFn: vehiculeService.getVehicules,
  });

  const confirmerMutation = useMutation({
    mutationFn: (id) => moniteurService.confirmerSeance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-seances'] });
      toast.success('Séance confirmée !');
      setSelectedSeance(null);
    },
    onError: (err) => toast.error(err.response?.data?.erreur || "Erreur")
  });

  const refuserMutation = useMutation({
    mutationFn: ({ id, motif }) => moniteurService.refuserSeance(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-seances'] });
      toast.success('Séance refusée.');
      setSelectedSeance(null);
    },
    onError: (err) => toast.error(err.response?.data?.erreur || "Erreur")
  });

  const terminerMutation = useMutation({
    mutationFn: (id) => moniteurService.terminerSeance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-seances'] });
      toast.success('Séance terminée, heures déduites !');
      setSelectedSeance(null);
    },
    onError: (err) => toast.error(err.response?.data?.erreur || "Erreur")
  });

  const handleRefuser = () => {
    const motif = window.prompt("Motif du refus :");
    if (motif) refuserMutation.mutate({ id: selectedSeance.id, motif });
  };

  const getNomCandidat = (id) => {
    const c = candidats.find(c => c.id === id);
    return c ? `${c.prenom} ${c.nom}` : 'Inconnu';
  };

  const getNomVehicule = (id) => {
    if (!id) return '—';
    const v = vehicules.find(v => v.id === id);
    return v ? `${v.marque} ${v.modele}` : 'Inconnu';
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement de votre planning...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Mon planning</h2>
      
      <Calendar 
        seances={seances} 
        onDayClick={null} 
        onEventClick={(seance) => setSelectedSeance(seance)} 
        role="moniteur"
      />

      <Modal 
        isOpen={!!selectedSeance} 
        onClose={() => setSelectedSeance(null)} 
        title={`Séance de ${selectedSeance?.typeSeance === 'CODE' ? 'code' : 'conduite'}`}
      >
        {selectedSeance && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
            
            <p><b>{selectedSeance.dateSeance}</b> à <b>{selectedSeance.heureDebut}</b></p>
            
            <p>Candidat : <b>{getNomCandidat(selectedSeance.candidatId)}</b></p>
            
            {selectedSeance.typeSeance === 'CONDUITE' && (
              <p>Véhicule : <b>{getNomVehicule(selectedSeance.vehiculeId)}</b></p>
            )}
            
            <p>Statut : <Badge status={selectedSeance.statut} /></p>
            
            <p style={{ color: 'var(--mut)', fontSize: '13px' }}>
              Confirmation candidat : {selectedSeance.confirmeParCandidat ? '✔' : '—'} · 
              moniteur : {selectedSeance.confirmeParMoniteur ? '✔' : '—'}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              {selectedSeance.statut === 'PLANIFIEE' && (
                <>
                  <Button onClick={() => confirmerMutation.mutate(selectedSeance.id)}>Confirmer</Button>
                  <Button variant="danger" onClick={handleRefuser}>Refuser</Button>
                </>
              )}
              
              {selectedSeance.statut === 'CONFIRMEE' && (
                <Button variant="gold" onClick={() => terminerMutation.mutate(selectedSeance.id)}>
                  Marquer comme terminée
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setSelectedSeance(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}