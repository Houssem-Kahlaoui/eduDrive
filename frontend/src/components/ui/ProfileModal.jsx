import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { utilisateurService } from '../../services/utilisateurService';
import Modal from './Modal';
import Button from './Button';
import { toast } from 'sonner';

export default function ProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const handleOpen = () => {
      reset({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        specialite: user?.specialite || 'CODE_CONDUITE',
        password: '',
      });
      setIsOpen(true);
    };

    window.addEventListener('open-profile-modal', handleOpen);
    return () => window.removeEventListener('open-profile-modal', handleOpen);
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      if (user.role === 'MONITEUR') {
        await utilisateurService.updateMoniteur(user.id, data);
      } else if (user.role === 'CANDIDAT') {
        await utilisateurService.updateCandidat(user.id, data);
      } else {
        await utilisateurService.updateAdmin(user.id, data);
      }

      const updatedUser = { ...user, nom: data.nom, prenom: data.prenom, email: data.email, telephone: data.telephone, specialite: data.specialite };
      localStorage.setItem('eduDriveUser', JSON.stringify(updatedUser));
      
      toast.success('Profil mis à jour avec succès !');
      setTimeout(() => window.location.reload(), 1000); 
      
    } catch (error) {
      toast.error(error.response?.data?.erreur || "Erreur lors de la modification.");
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modifier mon profil">
      <form className="fm" onSubmit={handleSubmit(onSubmit)} style={{ gap: '12px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label>Nom</label>
            <input {...register('nom', { required: 'Requis' })} />
          </div>
          <div>
            <label>Prénom</label>
            <input {...register('prenom', { required: 'Requis' })} />
          </div>
        </div>

        <div>
          <label>Email</label>
          <input type="email" {...register('email', { required: 'Requis' })} />
        </div>

        <div>
          <label>Téléphone</label>
          <input {...register('telephone')} />
        </div>

        {user.role === 'MONITEUR' && (
          <div>
            <label>Spécialité</label>
            <select {...register('specialite', { required: 'Requis' })}>
              <option value="CODE">Code</option>
              <option value="CONDUITE">Conduite</option>
              <option value="CODE_CONDUITE">Code & Conduite</option>
            </select>
          </div>
        )}

        <div>
          <label>Nouveau mot de passe <span style={{ fontSize: '11px', color: 'var(--mut)' }}>(laisser vide pour ne pas changer)</span></label>
          <input type="password" {...register('password')} />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}