const mongoose = require('mongoose');

const SocietyServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'medical',
      'ambulance',
      'plumber',
      'electrician',
      'security',
      'lift_technician',
      'fire_safety',
      'society_office',
      'other'
    ],
    default: 'other',
  },
  contact_person: {
    type: String,
    trim: true,
    default: null,
  },
  phone: {
    type: String,
    trim: true,
    default: null,
  },
  timing: {
    type: String,
    trim: true,
    default: 'Available on Call',
  },
  description: {
    type: String,
    trim: true,
    default: null,
  },
  is_emergency: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

SocietyServiceSchema.index({ category: 1 });
SocietyServiceSchema.index({ is_emergency: 1 });
SocietyServiceSchema.index({ is_active: 1 });

module.exports = mongoose.model('SocietyService', SocietyServiceSchema);
