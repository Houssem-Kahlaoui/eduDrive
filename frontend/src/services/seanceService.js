import api from './api';

export const seanceService = {
  getSeances: async () => {
    const res = await api.get('/admin/seances');
    return res.data;
  },
  createSeance: async (data) => {
    const res = await api.post('/admin/seances', data);
    return res.data;
  },
  updateSeance: async (id, data) => {
    const res = await api.put(`/admin/seances/${id}`, data);
    return res.data;
  },
  deleteSeance: async (id) => {
    await api.delete(`/admin/seances/${id}`);
  }
};