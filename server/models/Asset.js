const mongoose = require('mongoose');

const ServiceLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  done_by: {
    type: String,
    required: [true, 'Technician name is required'],
    trim: true
  }
}, { _id: true });

const AssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    maxlength: [100, 'Asset name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Asset type is required'],
    trim: true,
    lowercase: true,
    default: 'other'
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  status: {
    type: String,
    enum: ['working', 'under_maintenance', 'not_working'],
    default: 'working'
  },
  location: {
    type: String,
    default: null,
    trim: true
  },
  purchase_date: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  last_service_date: {
    type: Date,
    default: null
  },
  services: [ServiceLogSchema]
}, {
  timestamps: true
});

// Indexes
AssetSchema.index({ type: 1 });
AssetSchema.index({ category: 1 });
AssetSchema.index({ status: 1 });

// Update last_service_date when service is added
AssetSchema.pre('save', async function() {
  if (this.services && this.services.length > 0) {
    const lastService = this.services[this.services.length - 1];
    this.last_service_date = lastService.date;
  }
});

module.exports = mongoose.model('Asset', AssetSchema);
