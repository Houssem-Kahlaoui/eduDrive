import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'; // ✅ Import de Sonner
import { vehiculeService } from '../../services/vehiculeService';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function AdminVehicules() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [vehiculeToDelete, setVehiculeToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: vehicules = [], isLoading } = useQuery({
    queryKey: ['vehicules'],
    queryFn: vehiculeService.getVehicules,
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingVehicule) return vehiculeService.updateVehicule(editingVehicule.id, data);
      return vehiculeService.createVehicule(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
      setIsModalOpen(false);
      reset();
      
      // ✅ Remplacement des alertes par des toasts
      if (editingVehicule) {
        toast.success('Véhicule modifié avec succès !');
      } else {
        toast.success('Véhicule ajouté avec succès !');
      }
      
      setEditingVehicule(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.erreur || "Erreur lors de l'enregistrement");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vehiculeService.deleteVehicule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
      setIsConfirmOpen(false); 
      toast.success('Véhicule supprimé avec succès !'); // ✅ Toast succès
    },
    onError: (error) => {
      toast.error(error.response?.data?.erreur || "Erreur lors de la suppression"); // ✅ Toast erreur
    }
  });

  const handleAdd = () => {
    setEditingVehicule(null);
    reset({ immatriculation: '', marque: '', modele: '', etat: 'DISPONIBLE' });
    setIsModalOpen(true);
  };

  const handleEdit = (vehicule) => {
    setEditingVehicule(vehicule);
    reset({
      immatriculation: vehicule.immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      etat: vehicule.etat
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setVehiculeToDelete(id);
    setIsConfirmOpen(true);
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Véhicules</h2>
        <button className="btn" onClick={handleAdd} style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span> Ajouter un véhicule
        </button>
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicules.map((v) => (
              <tr key={v.id}>
                <td><b>{v.immatriculation}</b></td>
                <td>{v.marque}</td>
                <td>{v.modele}</td>
                <td><Badge status={v.etat} /></td>
                <td>
                  <button className="btn s o" onClick={() => handleEdit(v)} style={{ marginRight: '5px' }}>Modifier</button>
                  <button className="btn s r" onClick={() => handleDelete(v.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingVehicule ? 'Modifier' : 'Ajouter'} un véhicule`}
      >
        <form className="fm" onSubmit={handleSubmit((data) => saveMutation.mutate(data))} style={{ gap: '12px' }}>
          
          <div>
            <label>Immatriculation</label>
            <input {...register('immatriculation', { required: 'Requis' })} placeholder="Ex: 215 TUN 4821" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Marque</label>
              <input {...register('marque', { required: 'Requis' })} placeholder="Ex: Peugeot" />
            </div>
            <div>
              <label>Modèle</label>
              <input {...register('modele', { required: 'Requis' })} placeholder="Ex: 208" />
            </div>
          </div>

          <div>
            <label>État</label>
            <select {...register('etat')}>
              <option value="DISPONIBLE">Disponible</option>
              <option value="ENTRETIEN">En entretien</option>
              <option value="PANNE">En panne</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? '...' : (editingVehicule ? 'Modifier' : 'Enregistrer')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ✅ MODALE DE CONFIRMATION */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(vehiculeToDelete)}
        title="Supprimer le véhicule"
        message="Voulez-vous vraiment supprimer ce véhicule ?"
        confirmText="Supprimer"
        isDanger={true}
      />
    </div>
  );
}