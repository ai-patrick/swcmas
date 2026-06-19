import api from '@/api/axios.js';

export const listNotifications = async (page = 1, limit = 20, unread = false) => {
  const { data } = await api.get('/notifications', {
    params: { page, limit, unread: unread ? 'true' : 'false' },
  });
  return data.data; // returns { notifications, total, page, limit }
};

export const markNotificationRead = async (id) => {
  await api.patch(`/notifications/${id}/read`);
};
