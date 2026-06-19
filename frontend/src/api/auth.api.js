import api from '@/api/axios.js';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh-token');
  return response.data.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const resetPassword = async (email) => {
  const { data } = await api.post('/auth/reset-password', { email });
  return data;
};
