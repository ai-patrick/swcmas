const mongoose = require('mongoose');
const config = require('../config');

const anomalyAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: config.anomalyTypes,
    },
    severity: {
      type: String,
      required: true,
      enum: config.anomalySeverities,
      default: 'medium',
    },
    entityType: {
      type: String,
      required: true,
      enum: ['User', 'Collection', 'Complaint', 'Apartment'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: { type: Date },
    resolution: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

anomalyAlertSchema.index({ type: 1 });
anomalyAlertSchema.index({ isResolved: 1, severity: 1 });
anomalyAlertSchema.index({ entityType: 1, entityId: 1 });
anomalyAlertSchema.index({ createdAt: -1 });

const AnomalyAlert = mongoose.model('AnomalyAlert', anomalyAlertSchema);
module.exports = AnomalyAlert;