const mongoose = require('mongoose');
const config = require('../config');

const reportDataSchema = new mongoose.Schema({
  totalCollections: { type: Number, default: 0 },
  completedCollections: { type: Number, default: 0 },
  verifiedCollections: { type: Number, default: 0 },
  disputedCollections: { type: Number, default: 0 },
  totalComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  complaintBreakdown: { type: Map, of: Number },
  collectorPerformance: [
    {
      collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      totalCollections: Number,
      completed: Number,
      verified: Number,
      averageScore: Number,
    },
  ],
  landlordCompliance: [
    {
      landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      totalVerifications: Number,
      confirmed: Number,
      complianceRate: Number,
    },
  ],
  highRiskAreas: [
    {
      apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' },
      name: String,
      riskScore: Number,
      complaintCount: Number,
    },
  ],
  complaintTrends: { type: Object },
  violationTrends: { type: Object },
}, { _id: false });

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: config.reportTypes,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    period: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    data: {
      type: reportDataSchema,
      default: () => ({}),
    },
    aiSummary: { type: String },
    recommendations: [{ type: String }],
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ type: 1, 'period.start': 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;