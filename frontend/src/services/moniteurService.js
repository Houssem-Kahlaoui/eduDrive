import api from './api';

export const moniteurService = {
  getMesSeances: async (moniteurId) => {
    const res = await api.get(`/moniteurs/${moniteurId}/seances`);
    return res.data;
  },
  
  confirmerSeance: async (seanceId) => {
    const res = await api.put(`/seances/${seanceId}/confirmer/moniteur`);
    return res.data;
  },

  refuserSeance: async (seanceId, motif) => {
    const res = await api.put(`/seances/${seanceId}/refuser`, { motif });
    return res.data;
  },

  terminerSeance: async (seanceId) => {
    const res = await api.put(`/seances/${seanceId}/terminer`);
    return res.data;
  },

  getMesCandidats: async () => {
    const res = await api.get('/admin/candidats'); 
    return res.data;
  },

  declarerPret: async (candidatId, candidatData) => {
    const res = await api.put(`/admin/candidats/${candidatId}`, candidatData);
    return res.data;
  }
};