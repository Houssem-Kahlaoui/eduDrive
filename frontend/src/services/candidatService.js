import api from './api';

export const candidatService = {
  // Récupérer le profil complet du candidat
  getMonProfil: async (id) => {
    const res = await api.get(`/admin/candidats/${id}`);
    return res.data;
  },

  // Récupérer les séances du candidat
  getMesSeances: async (id) => {
    const res = await api.get(`/admin/candidats/${id}/seances`);
    return res.data;
  },

  // Récupérer les examens du candidat
  getMesExamens: async (id) => {
    const res = await api.get(`/admin/candidats/${id}/examens`);
    return res.data;
  },

  // Confirmer une séance
  confirmerSeance: async (seanceId) => {
    const res = await api.put(`/seances/${seanceId}/confirmer/candidat`);
    return res.data;
  },

  // Refuser une séance
  refuserSeance: async (seanceId, motif) => {
    const res = await api.put(`/seances/${seanceId}/refuser`, { motif });
    return res.data;
  }
};