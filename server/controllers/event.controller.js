const Event = require('../models/Event');

/**
 * @desc    Get all society events
 * @route   GET /api/events
 * @access  Private (All authenticated users)
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    const { category, timeframe, is_active } = req.query;

    const filter = {};
    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    } else {
      filter.is_active = true;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeframe === 'upcoming') {
      filter.event_date = { $gte: today };
    } else if (timeframe === 'past') {
      filter.event_date = { $lt: today };
    }

    const sortOrder = timeframe === 'past' ? { event_date: -1 } : { event_date: 1 };

    const events = await Event.find(filter)
      .populate('created_by', 'name role')
      .populate('updated_by', 'name role')
      .sort(sortOrder)
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Private
 */
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('created_by', 'name role email')
      .populate('updated_by', 'name role email')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    next(error);
  }
};

/**
 * @desc    Create a new society event
 * @route   POST /api/events
 * @access  Private (Manager, Admin only)
 */
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      event_date,
      event_time,
      location,
      organizer,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event title is required',
      });
    }

    if (!event_date) {
      return res.status(400).json({
        success: false,
        message: 'Event date is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event description is required',
      });
    }

    const event = await Event.create({
      title: title.trim(),
      category: category || 'other',
      description: description.trim(),
      event_date: new Date(event_date),
      event_time: event_time ? event_time.trim() : null,
      location: location ? location.trim() : 'Society Clubhouse',
      organizer: organizer ? organizer.trim() : 'Atharva Society Committee',
      is_active: true,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await event.populate('created_by', 'name role');

    res.status(201).json({
      success: true,
      message: 'Event scheduled successfully',
      data: event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private (Manager, Admin only)
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      event_date,
      event_time,
      location,
      organizer,
      is_active,
    } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (title) event.title = title.trim();
    if (category) event.category = category;
    if (description) event.description = description.trim();
    if (event_date) event.event_date = new Date(event_date);
    if (event_time !== undefined) event.event_time = event_time ? event_time.trim() : null;
    if (location !== undefined) event.location = location ? location.trim() : 'Society Clubhouse';
    if (organizer !== undefined) event.organizer = organizer ? organizer.trim() : 'Atharva Society Committee';
    if (is_active !== undefined) event.is_active = Boolean(is_active);
    event.updated_by = req.user._id;

    await event.save();
    await event.populate('created_by', 'name role');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Manager, Admin only)
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    next(error);
  }
};
