import api from './api';

export const examenService = {
  getExamens: async () => {
    const res = await api.get('/admin/examens');
    return res.data;
  },
  createExamen: async (data) => {
    const res = await api.post('/admin/examens', data);
    return res.data;
  },
  updateExamen: async (id, data) => {
    const res = await api.put(`/admin/examens/${id}`, data);
    return res.data;
  },
  deleteExamen: async (id) => {
    await api.delete(`/admin/examens/${id}`);
  }
};