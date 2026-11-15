import api from './api';

export const forfaitService = {
  getForfaits: async () => {
    const res = await api.get('/admin/forfaits');
    return res.data;
  },
  createForfait: async (data) => {
    const res = await api.post('/admin/forfaits', data);
    return res.data;
  },
  updateForfait: async (id, data) => {
    const res = await api.put(`/admin/forfaits/${id}`, data);
    return res.data;
  },
  deleteForfait: async (id) => {
    await api.delete(`/admin/forfaits/${id}`);
  }
};