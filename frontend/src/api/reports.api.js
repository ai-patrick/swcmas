import api from '@/api/axios.js';

export const listReports = async (params = {}) => {
  const { data } = await api.get('/reports', { params });
  return data.data;
};

export const getReport = async (id) => {
  const { data } = await api.get(`/reports/${id}`);
  return data.data;
};

export const generateReport = async (payload) => {
  const { data } = await api.post('/reports', payload);
  return data.data;
};
