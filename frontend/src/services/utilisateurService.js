import api from './api';

export const utilisateurService = {
  getCandidats: async () => {
    const res = await api.get('/admin/candidats');
    return res.data;
  },
  createCandidat: async (data) => {
    const res = await api.post('/admin/candidats', data);
    return res.data;
  },
  updateCandidat: async (id, data) => {
    const res = await api.put(`/admin/candidats/${id}`, data);
    return res.data;
  },
  deleteCandidat: async (id) => {
    await api.delete(`/admin/candidats/${id}`);
  },

  getMoniteurs: async () => {
    const res = await api.get('/admin/moniteurs');
    return res.data;
  },
  createMoniteur: async (data) => {
    const res = await api.post('/admin/moniteurs', data);
    return res.data;
  },
  updateMoniteur: async (id, data) => {
    const res = await api.put(`/admin/moniteurs/${id}`, data);
    return res.data;
  },
  deleteMoniteur: async (id) => {
    await api.delete(`/admin/moniteurs/${id}`);
  },

    getAdmins: async () => {
    const res = await api.get('/admin/admins');
    return res.data;
  },
  createAdmin: async (data) => {
    const res = await api.post('/admin/admins', data);
    return res.data;
  },
  updateAdmin: async (id, data) => {
    const res = await api.put(`/admin/admins/${id}`, data);
    return res.data;
  },
  deleteAdmin: async (id) => {
    await api.delete(`/admin/admins/${id}`);
  },
};