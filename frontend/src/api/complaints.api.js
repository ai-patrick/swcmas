import api from '@/api/axios.js';

export const listComplaints = async (page = 1, limit = 20, filters = {}) => {
  const { data } = await api.get('/complaints', {
    params: { page, limit, ...filters },
  });
  return data.data; // { complaints, total, page, limit }
};

export const createComplaint = async (payload) => {
  const { data } = await api.post('/complaints', payload);
  return data.data;
};

export const updateComplaint = async (id, payload) => {
  const { data } = await api.patch(`/complaints/${id}`, payload);
  return data.data;
};

export const deleteComplaint = async (id) => {
  await api.delete(`/complaints/${id}`);
};
