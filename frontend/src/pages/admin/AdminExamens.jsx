import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'; // ✅ Import de Sonner
import { examenService } from '../../services/examenService';
import { utilisateurService } from '../../services/utilisateurService'; 
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function AdminExamens() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamen, setEditingExamen] = useState(null);
  
  // ✅ États pour la confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [examenToDelete, setExamenToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: examens = [], isLoading } = useQuery({
    queryKey: ['examens'],
    queryFn: examenService.getExamens,
  });

  const { data: candidats = [] } = useQuery({
    queryKey: ['candidats'],
    queryFn: utilisateurService.getCandidats,
  });

  // --- FORMULAIRE ---
  const { register, handleSubmit, reset } = useForm();

  // --- MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingExamen) return examenService.updateExamen(editingExamen.id, data);
      return examenService.createExamen(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examens'] });
      setIsModalOpen(false);
      reset();
      
      // ✅ Remplacement des alertes par des toasts
      if (editingExamen) {
        toast.success('Examen modifié avec succès !');
      } else {
        toast.success('Examen ajouté avec succès !');
      }
      
      setEditingExamen(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.erreur || "Erreur lors de l'enregistrement"); // ✅ Toast erreur
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => examenService.deleteExamen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examens'] });
      setIsConfirmOpen(false); 
      toast.success('Examen supprimé avec succès !'); // ✅ Toast succès
    },
    onError: (error) => {
      toast.error(error.response?.data?.erreur || "Erreur lors de la suppression"); // ✅ Toast erreur
    }
  });

  const handleAdd = () => {
    setEditingExamen(null);
    reset({ candidatId: '', type: 'CODE', dateExamen: '', heure: '09:00', resultat: 'EN_ATTENTE' });
    setIsModalOpen(true);
  };

  const handleEdit = (examen) => {
    setEditingExamen(examen);
    reset({
      candidatId: examen.candidatId,
      type: examen.type,
      dateExamen: examen.dateExamen,
      heure: examen.heure,
      resultat: examen.resultat
    });
    setIsModalOpen(true);
  };

  // ✅ Fonction modifiée pour ouvrir la modale de confirmation
  const handleDelete = (id) => {
    setExamenToDelete(id);
    setIsConfirmOpen(true);
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Examens</h2>
        <button className="btn" onClick={handleAdd} style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span> Planifier un examen
        </button>
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Candidat</th>
              <th>Type</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Tentative</th>
              <th>Résultat</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {examens.map((e) => {
              const cand = candidats.find(c => c.id === e.candidatId);
              return (
                <tr key={e.id}>
                  <td>{cand ? `${cand.prenom} ${cand.nom}` : 'Inconnu'}</td>
                  <td>{e.type}</td>
                  <td>{e.dateExamen}</td>
                  <td>{e.heure}</td>
                  <td>N° {e.numeroTentative}</td>
                  <td><Badge status={e.resultat} /></td>
                  <td>
                    <button className="btn s o" onClick={() => handleEdit(e)} style={{ marginRight: '5px' }}>Modifier</button>
                    <button className="btn s r" onClick={() => handleDelete(e.id)}>Supprimer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingExamen ? 'Modifier' : 'Planifier'} un examen`}
      >
        <form className="fm" onSubmit={handleSubmit((data) => saveMutation.mutate(data))} style={{ gap: '12px' }}>
          
          <div>
            <label>Candidat</label>
            <select {...register('candidatId', { required: 'Requis' })} disabled={!!editingExamen}>
              <option value="">— Choisir un candidat prêt —</option>
              {candidats
                .filter(c => c.statutFormation === 'PRET_EXAMEN' || (editingExamen && c.id === editingExamen.candidatId))
                .map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
            
            {candidats.filter(c => c.statutFormation === 'PRET_EXAMEN').length === 0 && !editingExamen && (
              <span style={{ color: 'var(--mut)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Aucun candidat n'est déclaré "Prêt pour l'examen" actuellement.
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Type d'examen</label>
              <select {...register('type', { required: 'Requis' })} disabled={!!editingExamen}>
                <option value="CODE">Code</option>
                <option value="CIRCULATION">Circulation</option>
                <option value="MANOEUVRES">Manœuvres</option>
              </select>
            </div>
            
            {editingExamen && (
              <div>
                <label>Résultat</label>
                <select {...register('resultat')}>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="REUSSI">Réussi</option>
                  <option value="ECHOUE">Échoué</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Date</label>
              <input type="date" {...register('dateExamen', { required: 'Requis' })} />
            </div>
            <div>
              <label>Heure</label>
              <input type="time" {...register('heure', { required: 'Requis' })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? '...' : (editingExamen ? 'Modifier' : 'Enregistrer')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ✅ MODALE DE CONFIRMATION */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(examenToDelete)}
        title="Supprimer l'examen"
        message="Voulez-vous vraiment supprimer cet examen ? L'historique de tentative sera perdu."
        confirmText="Supprimer"
        isDanger={true}
      />
    </div>
  );
}