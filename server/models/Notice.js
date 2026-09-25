const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'maintenance',
      'water_interruption',
      'lift_maintenance',
      'parking',
      'society_meeting',
      'circular',
      'general',
    ],
    default: 'general',
  },
  description: {
    type: String,
    required: [true, 'Notice description is required'],
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  expiry_date: {
    type: Date,
    default: null,
  },
  location: {
    type: String,
    trim: true,
    default: 'All Wings / Society Wide',
  },
  is_pinned: {
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

NoticeSchema.index({ date: -1 });
NoticeSchema.index({ is_pinned: -1, date: -1 });
NoticeSchema.index({ category: 1 });
NoticeSchema.index({ is_active: 1 });

module.exports = mongoose.model('Notice', NoticeSchema);
