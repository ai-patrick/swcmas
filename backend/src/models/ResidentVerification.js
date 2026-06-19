const mongoose = require('mongoose');

const residentVerificationSchema = new mongoose.Schema(
  {
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
    },
    wasCollected: {
      type: Boolean,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

residentVerificationSchema.index({ collection: 1 });
residentVerificationSchema.index({ resident: 1 });
residentVerificationSchema.index({ apartment: 1 });

const ResidentVerification = mongoose.model('ResidentVerification', residentVerificationSchema);
module.exports = ResidentVerification;