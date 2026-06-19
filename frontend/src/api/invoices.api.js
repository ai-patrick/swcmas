import api from './axios.js';

export const listInvoices = async (page = 1, limit = 20) => {
  const { data } = await api.get('/invoices', { params: { page, limit } });
  return data.data; // { invoices, total, page, limit }
};

export const payInvoice = async (invoiceId, paymentMethod) => {
  const { data } = await api.patch(`/invoices/${invoiceId}/pay`, { paymentMethod });
  return data.data;
};
