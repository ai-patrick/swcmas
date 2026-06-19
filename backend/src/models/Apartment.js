const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    county: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    unitCount: {
      type: Number,
      required: true,
      min: 1,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wasteCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    collectionSchedule: {
      frequency: {
        type: String,
        enum: ['daily', 'every_other_day', 'weekly', 'biweekly', 'custom'],
        default: 'weekly',
      },
      days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
      time: { type: String, default: '08:00' },
      specialDates: [
        {
          date: Date,
          reason: String,
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

apartmentSchema.index({ 'location': '2dsphere' });
apartmentSchema.index({ landlord: 1 });
apartmentSchema.index({ wasteCollector: 1 });
apartmentSchema.index({ city: 1, county: 1 });
apartmentSchema.index({ isActive: 1 });

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment;