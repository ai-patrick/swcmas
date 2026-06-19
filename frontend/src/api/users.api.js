import api from '@/api/axios.js';

export const listUsers = async (page = 1, limit = 20) => {
  const { data } = await api.get('/users', {
    params: { page, limit },
  });
  return data.data; // { users, total, page, limit }
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload);
  return data.data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data.data;
};
