import api from '@/api/axios.js';

export const listMyVerifications = async (page = 1, limit = 20) => {
  const { data } = await api.get('/verifications/me', { params: { page, limit } });
  return data.data; // { verifications, total, page, limit }
};

export const respondVerification = async (id, payload) => {
  const { data } = await api.post(`/verifications/${id}/respond`, payload);
  return data.data;
};