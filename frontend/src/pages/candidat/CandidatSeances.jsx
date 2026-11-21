import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { candidatService } from '../../services/candidatService';
import Calendar from '../../components/ui/Calendar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'sonner';

export default function CandidatSeances() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedSeance, setSelectedSeance] = useState(null);

  const { data: seances = [], isLoading } = useQuery({
    queryKey: ['mes-seances-candidat', user.id],
    queryFn: () => candidatService.getMesSeances(user.id),
  });

  const confirmerMutation = useMutation({
    mutationFn: (id) => candidatService.confirmerSeance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-seances-candidat'] });
      toast.success('Séance confirmée !');
      setSelectedSeance(null);
    }
  });

  const refuserMutation = useMutation({
    mutationFn: ({ id, motif }) => candidatService.refuserSeance(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-seances-candidat'] });
      toast.success('Séance refusée.');
      setSelectedSeance(null);
    }
  });

  const handleRefuser = () => {
    const motif = window.prompt("Motif du refus :");
    if (motif) refuserMutation.mutate({ id: selectedSeance.id, motif });
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Mes séances</h2>
      
      <Calendar 
        seances={seances} 
        onDayClick={null} 
        onEventClick={(seance) => setSelectedSeance(seance)} 
        role="candidat"
      />

      <Modal 
        isOpen={!!selectedSeance} 
        onClose={() => setSelectedSeance(null)} 
        title={`Séance de ${selectedSeance?.typeSeance === 'CODE' ? 'code' : 'conduite'}`}
      >
        {selectedSeance && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
            <p><b>{selectedSeance.dateSeance}</b> à <b>{selectedSeance.heureDebut}</b></p>
            <p>Statut : <Badge status={selectedSeance.statut} /></p>
            <p style={{ color: 'var(--mut)', fontSize: '13px' }}>
              Confirmation candidat : {selectedSeance.confirmeParCandidat ? '✔' : '—'} · 
              moniteur : {selectedSeance.confirmeParMoniteur ? '✔' : '—'}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {selectedSeance.statut === 'PLANIFIEE' && !selectedSeance.confirmeParCandidat && (
                <>
                  <Button onClick={() => confirmerMutation.mutate(selectedSeance.id)}>Confirmer</Button>
                  <Button variant="danger" onClick={handleRefuser}>Refuser</Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedSeance(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}