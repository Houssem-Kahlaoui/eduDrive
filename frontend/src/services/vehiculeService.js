import api from './api';

export const vehiculeService = {
  getVehicules: async () => {
    const res = await api.get('/admin/vehicules');
    return res.data;
  },
  createVehicule: async (data) => {
    const res = await api.post('/admin/vehicules', data);
    return res.data;
  },
  updateVehicule: async (id, data) => {
    const res = await api.put(`/admin/vehicules/${id}`, data);
    return res.data;
  },
  deleteVehicule: async (id) => {
    await api.delete(`/admin/vehicules/${id}`);
  }
};