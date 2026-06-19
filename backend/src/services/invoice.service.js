const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');

const listInvoices = async ({ filter = {}, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const invoices = await Invoice.find(filter)
    .populate('apartment', 'name address')
    .populate('collectionRecord', 'scheduledDate completedAt verificationScore')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Invoice.countDocuments(filter);
  return { invoices, total, page, limit };
};

const payInvoice = async (invoiceId, paymentMethod, transactionId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.status === 'paid') throw new ApiError(400, 'Invoice is already paid');

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paymentMethod = paymentMethod || 'mpesa';
  invoice.transactionId = transactionId || `TRX-${Math.random().toString(36).substring(7).toUpperCase()}`;

  await invoice.save();
  return invoice;
};

module.exports = {
  listInvoices,
  payInvoice,
};
