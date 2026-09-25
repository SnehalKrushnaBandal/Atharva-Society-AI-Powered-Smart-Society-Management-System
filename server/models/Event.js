const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: [
      'festival',
      'meeting',
      'cultural',
      'sports',
      'celebration',
      'other',
    ],
    default: 'other',
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
  },
  event_date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  event_time: {
    type: String,
    trim: true,
    default: null,
  },
  location: {
    type: String,
    required: [true, 'Event venue / location is required'],
    trim: true,
    default: 'Society Clubhouse',
  },
  organizer: {
    type: String,
    trim: true,
    default: 'Atharva Society Committee',
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

EventSchema.index({ event_date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ is_active: 1 });

module.exports = mongoose.model('Event', EventSchema);
