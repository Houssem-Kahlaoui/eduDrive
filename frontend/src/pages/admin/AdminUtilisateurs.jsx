import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { utilisateurService } from '../../services/utilisateurService';
import { forfaitService } from '../../services/forfaitService';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function AdminUtilisateurs() {
  const [activeTab, setActiveTab] = useState('CANDIDATS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const queryClient = useQueryClient();

  // --- RÉCUPÉRATION DES DONNÉES ---
  const { data: candidats = [], isLoading: loadC } = useQuery({ queryKey: ['candidats'], queryFn: utilisateurService.getCandidats });
  const { data: moniteurs = [], isLoading: loadM } = useQuery({ queryKey: ['moniteurs'], queryFn: utilisateurService.getMoniteurs });
  const { data: admins = [], isLoading: loadA } = useQuery({ queryKey: ['admins'], queryFn: utilisateurService.getAdmins });
  const { data: forfaits = [] } = useQuery({ queryKey: ['forfaits'], queryFn: forfaitService.getForfaits });

  // --- FORMULAIRE ---
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { actif: true }
  });

  // ✅ On surveille l'état de la case
  const isActif = watch('actif');

  // --- MUTATION (AJOUT / MODIFICATION) ---
  const saveMutation = useMutation({
    mutationFn: (data) => {
      data.actif = data.actif === true || data.actif === 'true';
      if (data.forfaitId === '') delete data.forfaitId;

      if (editingUser) {
        // Mode Modification
        if (activeTab === 'CANDIDATS') return utilisateurService.updateCandidat(editingUser.id, data);
        if (activeTab === 'MONITEURS') return utilisateurService.updateMoniteur(editingUser.id, data);
        return utilisateurService.updateAdmin(editingUser.id, data);
      } else {
        // Mode Ajout
        if (activeTab === 'CANDIDATS') return utilisateurService.createCandidat(data);
        if (activeTab === 'MONITEURS') return utilisateurService.createMoniteur(data);
        return utilisateurService.createAdmin(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab.toLowerCase()] });
      setIsModalOpen(false);
      reset();
      alert(editingUser ? 'Modification réussie !' : 'Ajout réussi !');
      setEditingUser(null);
    },
    onError: (error) => {
      alert(error.response?.data?.erreur || "Erreur");
    }
  });

  // --- MUTATION (SUPPRESSION) ---
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (activeTab === 'CANDIDATS') return utilisateurService.deleteCandidat(id);
      if (activeTab === 'MONITEURS') return utilisateurService.deleteMoniteur(id);
      return utilisateurService.deleteAdmin(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab.toLowerCase()] });
      alert('Suppression réussie !');
    },
    onError: (error) => {
      alert(error.response?.data?.erreur || "Erreur lors de la suppression");
    }
  });

  // --- HELPERS ---
  const handleAdd = () => {
    setEditingUser(null);
    reset({
      nom: '', prenom: '', email: '', password: '', telephone: '',
      dateNaissance: '', typePermis: 'B', adresse: '', specialite: 'CODE', forfaitId: '',
      actif: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      password: '', 
      telephone: user.telephone || '',
      dateNaissance: user.dateNaissance || '',
      typePermis: user.typePermis || 'B',
      adresse: user.adresse || '',
      specialite: user.specialite || 'CODE',
      forfaitId: user.forfaitId || '',
      actif: user.actif ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  if (loadC || loadM || loadA) return <div style={{ padding: '20px' }}>Chargement des données...</div>;

  const isPending = saveMutation.isPending;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Utilisateurs</h2>
        <button
          className="btn"
          onClick={handleAdd}
          style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span>
          Ajouter un {activeTab === 'CANDIDATS' ? 'Candidat' : activeTab === 'MONITEURS' ? 'Moniteur' : 'Admin'}
        </button>
      </div>

      {/* Onglets */}
      <div className="tabs" style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <button className={activeTab === 'CANDIDATS' ? 'on' : ''} onClick={() => setActiveTab('CANDIDATS')}>Candidats</button>
        <button className={activeTab === 'MONITEURS' ? 'on' : ''} onClick={() => setActiveTab('MONITEURS')}>Moniteurs</button>
        <button className={activeTab === 'ADMINS' ? 'on' : ''} onClick={() => setActiveTab('ADMINS')}>Admins</button>
      </div>

      {/* TABLEAU CANDIDATS */}
      {activeTab === 'CANDIDATS' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Forfait</th>
                <th>Statut Formation</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidats.map((c) => (
                <tr key={c.id}>
                  <td>{c.prenom} {c.nom}</td>
                  <td>{c.email}</td>
                  <td>{c.forfaitNom || <span style={{ color: 'var(--mut)' }}>Non choisi</span>}</td>
                  <td><Badge status={c.statutFormation} /></td>
                  <td>{c.actif ? '✅' : '❌'}</td>
                  <td>
                    <button className="btn s o" onClick={() => handleEdit(c)} style={{ marginRight: '5px' }}>Modifier</button>
                    <button className="btn s r" onClick={() => handleDelete(c.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLEAU MONITEURS */}
      {activeTab === 'MONITEURS' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {moniteurs.map((m) => (
                <tr key={m.id}>
                  <td>{m.prenom} {m.nom}</td>
                  <td>{m.email}</td>
                  <td>{m.specialite}</td>
                  <td>{m.actif ? '✅' : '❌'}</td>
                  <td>
                    <button className="btn s o" onClick={() => handleEdit(m)} style={{ marginRight: '5px' }}>Modifier</button>
                    <button className="btn s r" onClick={() => handleDelete(m.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLEAU ADMINS */}
      {activeTab === 'ADMINS' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.prenom} {a.nom}</td>
                  <td>{a.email}</td>
                  <td>{a.actif ? '✅' : '❌'}</td>
                  <td>
                    <button className="btn s o" onClick={() => handleEdit(a)} style={{ marginRight: '5px' }}>Modifier</button>
                    <button className="btn s r" onClick={() => handleDelete(a.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALE D'AJOUT / MODIFICATION */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingUser ? 'Modifier' : 'Ajouter'} un ${activeTab === 'CANDIDATS' ? 'Candidat' : activeTab === 'MONITEURS' ? 'Moniteur' : 'Admin'}`}
      >
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Email</label>
              <input type="email" {...register('email', { required: 'Requis' })} />
            </div>
            <div>
              <label>Mot de passe {editingUser && <span style={{ color: 'var(--mut)', fontSize: '11px' }}>(laisser vide pour ne pas changer)</span>}</label>
              <input
                type="password"
                {...register('password', { required: editingUser ? false : 'Requis' })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Téléphone</label>
              <input {...register('telephone')} />
            </div>

            {activeTab === 'CANDIDATS' && (
              <div>
                <label>Date de naissance</label>
                <input type="date" {...register('dateNaissance', { required: 'Requis' })} />
              </div>
            )}

            {activeTab === 'MONITEURS' && (
              <div>
                <label>Spécialité</label>
                <select {...register('specialite', { required: 'Requis' })}>
                  <option value="CODE">Code</option>
                  <option value="CONDUITE">Conduite</option>
                  <option value="CODE_CONDUITE">Code & Conduite</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'CANDIDATS' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Type de permis</label>
                  <select {...register('typePermis')}>
                    <option value="B">Permis B</option>
                    <option value="A1">Permis A1</option>
                  </select>
                </div>
                <div>
                  <label>Forfait (optionnel)</label>
                  <select {...register('forfaitId')}>
                    <option value="">— Aucun —</option>
                    {forfaits.map(f => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label>Adresse</label>
                <input {...register('adresse')} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={isActif}
              onChange={(e) => setValue('actif', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label
              onClick={() => setValue('actif', !isActif)}
              style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}
            >
              Compte actif
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '...' : (editingUser ? 'Modifier' : 'Enregistrer')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}