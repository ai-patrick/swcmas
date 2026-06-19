const invoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    
    // Landlords only see their own invoices
    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    }

    const result = await invoiceService.listInvoices({ filter, page, limit });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

const pay = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const invoice = await invoiceService.payInvoice(req.params.id, paymentMethod, transactionId);
    
    // Attach audit payload
    req.newValue = invoice;

    res.json(new ApiResponse({ data: invoice, message: 'Payment successful' }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  pay,
};
