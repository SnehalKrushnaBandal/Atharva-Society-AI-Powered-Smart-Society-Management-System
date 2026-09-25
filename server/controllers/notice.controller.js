const Notice = require('../models/Notice');

/**
 * @desc    Get all society notices
 * @route   GET /api/notices
 * @access  Private (All authenticated users)
 */
exports.getAllNotices = async (req, res, next) => {
  try {
    const { category, priority, is_pinned, is_active } = req.query;

    const filter = {};
    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    } else {
      filter.is_active = true;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (is_pinned !== undefined) {
      filter.is_pinned = is_pinned === 'true';
    }

    const notices = await Notice.find(filter)
      .populate('created_by', 'name role')
      .populate('updated_by', 'name role')
      .sort({ is_pinned: -1, date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    next(error);
  }
};

/**
 * @desc    Get single notice by ID
 * @route   GET /api/notices/:id
 * @access  Private
 */
exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('created_by', 'name role email')
      .populate('updated_by', 'name role email')
      .lean();

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    next(error);
  }
};

/**
 * @desc    Create a new society notice
 * @route   POST /api/notices
 * @access  Private (Manager, Admin only)
 */
exports.createNotice = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      priority,
      date,
      expiry_date,
      location,
      is_pinned,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Notice title is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Notice description is required',
      });
    }

    const notice = await Notice.create({
      title: title.trim(),
      category: category || 'general',
      description: description.trim(),
      priority: priority || 'normal',
      date: date ? new Date(date) : new Date(),
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      location: location ? location.trim() : 'All Wings / Society Wide',
      is_pinned: Boolean(is_pinned),
      is_active: true,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await notice.populate('created_by', 'name role');

    res.status(201).json({
      success: true,
      message: 'Notice published successfully',
      data: notice,
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    next(error);
  }
};

/**
 * @desc    Update a notice
 * @route   PUT /api/notices/:id
 * @access  Private (Manager, Admin only)
 */
exports.updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      priority,
      date,
      expiry_date,
      location,
      is_pinned,
      is_active,
    } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    if (title) notice.title = title.trim();
    if (category) notice.category = category;
    if (description) notice.description = description.trim();
    if (priority) notice.priority = priority;
    if (date) notice.date = new Date(date);
    if (expiry_date !== undefined) notice.expiry_date = expiry_date ? new Date(expiry_date) : null;
    if (location !== undefined) notice.location = location ? location.trim() : 'All Wings / Society Wide';
    if (is_pinned !== undefined) notice.is_pinned = Boolean(is_pinned);
    if (is_active !== undefined) notice.is_active = Boolean(is_active);
    notice.updated_by = req.user._id;

    await notice.save();
    await notice.populate('created_by', 'name role');

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    next(error);
  }
};

/**
 * @desc    Delete a notice
 * @route   DELETE /api/notices/:id
 * @access  Private (Manager, Admin only)
 */
exports.deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    next(error);
  }
};

/**
 * @desc    Toggle pinned status of a notice
 * @route   PATCH /api/notices/:id/pin
 * @access  Private (Manager, Admin only)
 */
exports.togglePinNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    notice.is_pinned = !notice.is_pinned;
    notice.updated_by = req.user._id;
    await notice.save();

    res.status(200).json({
      success: true,
      message: `Notice ${notice.is_pinned ? 'pinned to top' : 'unpinned'}`,
      data: notice,
    });
  } catch (error) {
    console.error('Error pinning notice:', error);
    next(error);
  }
};
