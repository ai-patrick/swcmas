const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: true,
  },
  collectionRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 1500, // Standard fee per collection (KES for example)
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  paidAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank_transfer', null],
    default: null,
  },
  transactionId: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
