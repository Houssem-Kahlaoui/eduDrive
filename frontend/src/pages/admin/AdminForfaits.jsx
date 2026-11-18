import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner'; // ✅ Import de Sonner
import { forfaitService } from '../../services/forfaitService';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function AdminForfaits() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForfait, setEditingForfait] = useState(null);
  
  // ✅ États pour la confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [forfaitToDelete, setForfaitToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: forfaits = [], isLoading } = useQuery({
    queryKey: ['forfaits'],
    queryFn: forfaitService.getForfaits,
  });

  const { register, handleSubmit, reset, control } = useForm();

  const typeSelectionne = useWatch({ control, name: 'typeForfait' });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (data.typeForfait === 'CODE_SEUL') data.heuresConduite = 0;
      
      if (editingForfait) return forfaitService.updateForfait(editingForfait.id, data);
      return forfaitService.createForfait(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forfaits'] });
      setIsModalOpen(false);
      reset();
      
      // ✅ Remplacement des alertes par des toasts
      if (editingForfait) {
        toast.success('Forfait modifié avec succès !');
      } else {
        toast.success('Forfait ajouté avec succès !');
      }
      
      setEditingForfait(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.erreur || "Erreur lors de l'enregistrement"); // ✅ Toast erreur
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => forfaitService.deleteForfait(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forfaits'] });
      setIsConfirmOpen(false); 
      toast.success('Forfait supprimé avec succès !'); // ✅ Toast succès
    },
    onError: (error) => {
      toast.error(error.response?.data?.erreur || "Erreur lors de la suppression"); // ✅ Toast erreur
    }
  });

  // --- HELPERS ---
  const handleAdd = () => {
    setEditingForfait(null);
    reset({ nom: '', typeForfait: 'CODE_CONDUITE', heuresCode: 0, heuresConduite: 0, prix: 0, actif: true });
    setIsModalOpen(true);
  };

  const handleEdit = (forfait) => {
    setEditingForfait(forfait);
    reset({
      nom: forfait.nom,
      typeForfait: forfait.typeForfait,
      heuresCode: forfait.heuresCode,
      heuresConduite: forfait.heuresConduite,
      prix: forfait.prix,
      actif: forfait.actif
    });
    setIsModalOpen(true);
  };

  // ✅ Fonction modifiée pour ouvrir la modale de confirmation
  const handleDelete = (id) => {
    setForfaitToDelete(id);
    setIsConfirmOpen(true);
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Forfaits</h2>
        <button className="btn" onClick={handleAdd} style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span> Ajouter un forfait
        </button>
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Heures Code</th>
              <th>Heures Conduite</th>
              <th>Prix</th>
              <th>Actif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forfaits.map((f) => (
              <tr key={f.id}>
                <td>{f.nom}</td>
                <td><Badge status={f.typeForfait} /></td>
                <td>{f.heuresCode} h</td>
                <td>{f.heuresConduite} h</td>
                <td>{f.prix} DT</td>
                <td>{f.actif ? '✅' : '❌'}</td>
                <td>
                  <button className="btn s o" onClick={() => handleEdit(f)} style={{ marginRight: '5px' }}>Modifier</button>
                  <button className="btn s r" onClick={() => handleDelete(f.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE D'AJOUT / MODIFICATION */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingForfait ? 'Modifier' : 'Ajouter'} un forfait`}
      >
        <form className="fm" onSubmit={handleSubmit((data) => saveMutation.mutate(data))} style={{ gap: '12px' }}>
          
          <div>
            <label>Nom du forfait</label>
            <input {...register('nom', { required: 'Requis' })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Type de forfait</label>
              <select {...register('typeForfait')}>
                <option value="CODE_SEUL">Code seul</option>
                <option value="CODE_CONDUITE">Code & Conduite</option>
                <option value="A_L_HEURE">À l'heure</option>
              </select>
            </div>
            <div>
              <label>Prix (DT)</label>
              <input type="number" step="0.01" {...register('prix', { required: 'Requis', min: 0 })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Heures de code</label>
              <input type="number" {...register('heuresCode', { required: 'Requis', min: 0 })} />
            </div>

            {typeSelectionne !== 'CODE_SEUL' ? (
              <div>
                <label>Heures de conduite</label>
                <input type="number" {...register('heuresConduite', { required: 'Requis', min: 0 })} />
              </div>
            ) : (
              <input type="hidden" value="0" {...register('heuresConduite')} />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input type="checkbox" {...register('actif')} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label style={{ margin: 0, cursor: 'pointer' }}>Forfait actif (visible par les candidats)</label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? '...' : (editingForfait ? 'Modifier' : 'Enregistrer')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ✅ MODALE DE CONFIRMATION */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(forfaitToDelete)}
        title="Supprimer le forfait"
        message="Voulez-vous vraiment supprimer ce forfait ? Les candidats associés n'auront plus de forfait."
        confirmText="Supprimer"
        isDanger={true}
      />
    </div>
  );
}