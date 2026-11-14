import api from './api';

export const forfaitService = {
  getForfaits: async () => {
    const res = await api.get('/admin/forfaits');
    return res.data;
  }
};