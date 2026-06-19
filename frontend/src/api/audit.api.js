import api from './axios.js';

export const listAuditLogs = async (page = 1, limit = 20, entity = '') => {
  const params = { page, limit };
  if (entity) params.entity = entity;
  
  const { data } = await api.get('/audit', { params });
  return data.data; // { logs, total, page, limit }
};
