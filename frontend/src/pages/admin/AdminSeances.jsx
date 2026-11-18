import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { seanceService } from '../../services/seanceService';
import { utilisateurService } from '../../services/utilisateurService';
import { vehiculeService } from '../../services/vehiculeService';
import Calendar from '../../components/ui/Calendar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AdminSeances() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState(null);
  const queryClient = useQueryClient();

  const { data: seances = [], isLoading: loadS } = useQuery({ queryKey: ['seances'], queryFn: seanceService.getSeances });
  const { data: candidats = [] } = useQuery({ queryKey: ['candidats'], queryFn: utilisateurService.getCandidats });
  const { data: moniteurs = [] } = useQuery({ queryKey: ['moniteurs'], queryFn: utilisateurService.getMoniteurs });
  const { data: vehicules = [] } = useQuery({ queryKey: ['vehicules'], queryFn: vehiculeService.getVehicules });

  const { register, handleSubmit, reset, watch } = useForm();
  
  const typeSeance = watch('typeSeance', 'CONDUITE');

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (data.typeSeance === 'CODE') data.vehiculeId = null;
      if (data.vehiculeId === '') data.vehiculeId = null;

      if (editingSeance) return seanceService.updateSeance(editingSeance.id, data);
      return seanceService.createSeance(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] });
      setIsModalOpen(false);
      reset();
      alert(editingSeance ? 'Séance modifiée !' : 'Séance planifiée !');
      setEditingSeance(null);
    },
    onError: (error) => alert(error.response?.data?.erreur || "Erreur (Conflit d'horaire ?)")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => seanceService.deleteSeance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] });
      setIsModalOpen(false);
      alert('Séance supprimée !');
    }
  });

  const handleDayClick = (date) => {
    setEditingSeance(null);
    reset({
      dateSeance: date,
      heureDebut: '09:00',
      duree: 60,
      typeSeance: 'CONDUITE',
      candidatId: '',
      moniteurId: '',
      vehiculeId: ''
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (seance) => {
    setEditingSeance(seance);
    reset({
      dateSeance: seance.dateSeance,
      heureDebut: seance.heureDebut,
      duree: seance.duree,
      typeSeance: seance.typeSeance,
      candidatId: seance.candidatId,
      moniteurId: seance.moniteurId,
      vehiculeId: seance.vehiculeId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm("Voulez-vous vraiment annuler cette séance ?")) {
      deleteMutation.mutate(editingSeance.id);
    }
  };

  if (loadS) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Calendrier des séances</h2>
        <p style={{ color: 'var(--mut)', fontSize: '14px' }}>Cliquez sur un jour pour planifier une séance.</p>
      </div>

      <Calendar 
        seances={seances} 
        onDayClick={handleDayClick} 
        onEventClick={handleEventClick} 
        role="admin"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingSeance ? 'Détails de la séance' : 'Planifier une séance'}`}
      >
        <form className="fm" onSubmit={handleSubmit((data) => saveMutation.mutate(data))} style={{ gap: '12px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Date</label>
              <input type="date" {...register('dateSeance', { required: 'Requis' })} />
            </div>
            <div>
              <label>Heure</label>
              <input type="time" {...register('heureDebut', { required: 'Requis' })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Type</label>
              <select {...register('typeSeance')}>
                <option value="CONDUITE">Conduite</option>
                <option value="CODE">Code</option>
              </select>
            </div>
            <div>
              <label>Durée (min)</label>
              <input type="number" step="15" {...register('duree', { required: 'Requis' })} />
            </div>
          </div>

          <div>
            <label>Candidat</label>
            <select {...register('candidatId', { required: 'Requis' })}>
              <option value="">— Choisir —</option>
              {candidats.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
          </div>

          <div>
            <label>Moniteur</label>
            <select {...register('moniteurId', { required: 'Requis' })}>
              <option value="">— Choisir —</option>
              {moniteurs.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
          </div>

          {typeSeance === 'CONDUITE' && (
            <div>
              <label>Véhicule</label>
              <select {...register('vehiculeId', { required: 'Requis pour la conduite' })}>
                <option value="">— Choisir —</option>
                {vehicules.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele} ({v.immatriculation})</option>)}
              </select>
            </div>
          )}

          {editingSeance && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--bd)' }}>
              <p>Statut : <Badge status={editingSeance.statut} /></p>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '15px' }}>
                <button type="button" className="btn s r" onClick={handleDelete}>Supprimer</button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? '...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </div>
          )}

          {!editingSeance && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveMutation.isPending}>Planifier</Button>
            </div>
          )}

        </form>
      </Modal>
    </div>
  );
}