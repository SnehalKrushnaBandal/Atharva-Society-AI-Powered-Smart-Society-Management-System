const SocietyService = require('../models/SocietyService');

// Seed default initial services if collection is empty
// Official national emergency numbers are pre-configured.
// Society-specific services have phone: null until configured by society manager/admin.
const DEFAULT_SERVICES = [
  // --- Official National Emergency Helplines ---
  {
    name: 'National Emergency & Police Helpline',
    category: 'security',
    contact_person: 'Police Control Room',
    phone: '112',
    timing: '24/7 National Emergency',
    description: 'National unified emergency response and local police assistance',
    is_emergency: true,
  },
  {
    name: 'Emergency Ambulance Helpline',
    category: 'ambulance',
    contact_person: 'National Ambulance Dispatch',
    phone: '102',
    timing: '24/7 Emergency Dispatch',
    description: 'Rapid ambulance transport and emergency medical response',
    is_emergency: true,
  },
  {
    name: 'Medical Emergency Doctor on Call',
    category: 'medical',
    contact_person: 'Emergency Health Helpline',
    phone: '108',
    timing: '24/7 Medical Helpline',
    description: 'Emergency medical consultation and disaster medical response',
    is_emergency: true,
  },
  {
    name: 'Fire Emergency & Disaster Unit',
    category: 'fire_safety',
    contact_person: 'Fire Brigade Control',
    phone: '101',
    timing: '24/7 Fire Emergency',
    description: 'Municipal fire control room and rescue brigade',
    is_emergency: true,
  },

  // --- Society Internal Services (Configurable by Manager/Admin) ---
  {
    name: 'Lift Breakdown & Rescue Tech',
    category: 'lift_technician',
    contact_person: null,
    phone: null,
    timing: '24/7 On-Call Support',
    description: 'Elevator technician for breakdown repairs and trapped passenger rescue (Configure contact in Society Services)',
    is_emergency: true,
  },
  {
    name: 'Main Gate Security Desk',
    category: 'security',
    contact_person: null,
    phone: null,
    timing: '24/7 Gate & Patrol',
    description: 'Main gate entry, visitor verification, and intercom desk (Configure contact in Society Services)',
    is_emergency: true,
  },
  {
    name: 'Society Management Office',
    category: 'society_office',
    contact_person: null,
    phone: null,
    timing: '10:00 AM - 6:00 PM',
    description: 'Administrative support, maintenance billing, parking allotment, and NOCs (Configure contact in Society Services)',
    is_emergency: false,
  },
  {
    name: 'Society Electrician',
    category: 'electrician',
    contact_person: null,
    phone: null,
    timing: '8:00 AM - 8:00 PM',
    description: 'Common area lighting, transformer room, and flat electrical maintenance (Configure contact in Society Services)',
    is_emergency: false,
  },
  {
    name: 'Society Plumber',
    category: 'plumber',
    contact_person: null,
    phone: null,
    timing: '9:00 AM - 7:00 PM',
    description: 'Water pump room, overhead tanks, and residential plumbing repairs (Configure contact in Society Services)',
    is_emergency: false,
  },
];

/**
 * @desc    Get all society services
 * @route   GET /api/services
 * @access  Private (All authenticated users)
 */
exports.getAllServices = async (req, res, next) => {
  try {
    const { category, is_emergency, is_active } = req.query;

    const count = await SocietyService.countDocuments();
    if (count === 0) {
      await SocietyService.insertMany(DEFAULT_SERVICES);
    }

    const filter = {};
    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    } else {
      filter.is_active = true;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (is_emergency !== undefined) {
      filter.is_emergency = is_emergency === 'true';
    }

    const services = await SocietyService.find(filter)
      .populate('created_by', 'name role')
      .populate('updated_by', 'name role')
      .sort({ is_emergency: -1, category: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    next(error);
  }
};

/**
 * @desc    Get emergency contacts & helplines
 * @route   GET /api/services/emergency-contacts
 * @access  Private (All authenticated users)
 */
exports.getEmergencyContacts = async (req, res, next) => {
  try {
    const count = await SocietyService.countDocuments();
    if (count === 0) {
      await SocietyService.insertMany(DEFAULT_SERVICES);
    }

    const emergencyServices = await SocietyService.find({
      is_active: true,
      $or: [
        { is_emergency: true },
        { category: { $in: ['medical', 'ambulance', 'fire_safety', 'security', 'lift_technician'] } }
      ]
    })
      .sort({ is_emergency: -1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: emergencyServices.length,
      data: emergencyServices,
    });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    next(error);
  }
};

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Private
 */
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await SocietyService.findById(req.params.id)
      .populate('created_by', 'name email role')
      .populate('updated_by', 'name email role')
      .lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    next(error);
  }
};

/**
 * @desc    Create a new society service
 * @route   POST /api/services
 * @access  Private (Manager, Admin only)
 */
exports.createService = async (req, res, next) => {
  try {
    const {
      name,
      category,
      contact_person,
      phone,
      timing,
      description,
      is_emergency,
      is_active,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Service category is required',
      });
    }

    const newService = await SocietyService.create({
      name: name.trim(),
      category,
      contact_person: contact_person ? contact_person.trim() : null,
      phone: phone ? phone.trim() : null,
      timing: timing ? timing.trim() : 'Available on Call',
      description: description ? description.trim() : null,
      is_emergency: Boolean(is_emergency),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Society service added successfully',
      data: newService,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    next(error);
  }
};

/**
 * @desc    Update a society service
 * @route   PUT /api/services/:id
 * @access  Private (Manager, Admin only)
 */
exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      contact_person,
      phone,
      timing,
      description,
      is_emergency,
      is_active,
    } = req.body;

    const service = await SocietyService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (name) service.name = name.trim();
    if (category) service.category = category;
    if (contact_person !== undefined) service.contact_person = contact_person ? contact_person.trim() : null;
    if (phone !== undefined) service.phone = phone ? phone.trim() : null;
    if (timing !== undefined) service.timing = timing ? timing.trim() : 'Available on Call';
    if (description !== undefined) service.description = description ? description.trim() : null;
    if (is_emergency !== undefined) service.is_emergency = Boolean(is_emergency);
    if (is_active !== undefined) service.is_active = Boolean(is_active);
    service.updated_by = req.user._id;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Society service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    next(error);
  }
};

/**
 * @desc    Delete a society service
 * @route   DELETE /api/services/:id
 * @access  Private (Manager, Admin only)
 */
exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await SocietyService.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Society service deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    next(error);
  }
};
