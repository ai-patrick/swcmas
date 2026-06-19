import api from '@/api/axios.js';

export const listApartments = async (page = 1, limit = 20) => {
  const { data } = await api.get('/apartments', {
    params: { page, limit },
  });
  return data.data; // { apartments, total, page, limit }
};

export const deleteApartment = async (id) => {
  await api.delete(`/apartments/${id}`);
};

export const createApartment = async (payload) => {
  const { data } = await api.post('/apartments', payload);
  return data.data;
};

export const updateApartment = async (id, payload) => {
  const { data } = await api.patch(`/apartments/${id}`, payload);
  return data.data;
};
