const Asset = require('../models/Asset');

/**
 * @desc    Get all assets
 * @route   GET /api/assets
 * @access  Private (All authenticated users)
 */
exports.getAllAssets = async (req, res, next) => {
  try {
    const { status, type, category, search } = req.query;
    
    // Build query
    const query = {};
    if (status && ['working', 'under_maintenance', 'not_working'].includes(status)) {
      query.status = status;
    }
    if (type) {
      query.type = type.toLowerCase().trim();
    }
    if (category) {
      query.category = category.trim();
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { notes: searchRegex },
        { category: searchRegex }
      ];
    }

    const assets = await Asset.find(query)
      .sort({ category: 1, type: 1, name: 1 });

    // Calculate stats
    const allAssets = await Asset.find({});
    const assetList = Array.isArray(allAssets) ? allAssets : (Array.isArray(assets) ? assets : []);

    const stats = {
      total: assetList.length,
      working: assetList.filter(a => a.status === 'working').length,
      under_maintenance: assetList.filter(a => a.status === 'under_maintenance').length,
      not_working: assetList.filter(a => a.status === 'not_working').length,
      total_quantity: assetList.reduce((sum, a) => sum + (a.quantity || 1), 0)
    };

    res.status(200).json({
      success: true,
      data: assets,
      stats
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    next(error);
  }
};

/**
 * @desc    Get single asset by ID
 * @route   GET /api/assets/:id
 * @access  Private (All authenticated users)
 */
exports.getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    next(error);
  }
};

/**
 * @desc    Create a new asset
 * @route   POST /api/assets
 * @access  Private (Manager and Admin)
 */
exports.createAsset = async (req, res, next) => {
  try {
    const { name, type, category, quantity, status, location, purchase_date, notes } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Asset name is required'
      });
    }

    const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const targetType = (type && type.trim()) ? type.toLowerCase().trim() : 'other';
    const targetStatus = status && ['working', 'under_maintenance', 'not_working'].includes(status)
      ? status
      : 'working';

    // Create asset
    const asset = await Asset.create({
      name: name.trim(),
      type: targetType,
      category: (category && category.trim()) ? category.trim() : 'General',
      quantity: parsedQuantity,
      status: targetStatus,
      location: location ? location.trim() : null,
      purchase_date: purchase_date ? new Date(purchase_date) : null,
      notes: notes ? notes.trim() : null,
      services: []
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    next(error);
  }
};

/**
 * @desc    Update asset details
 * @route   PUT /api/assets/:id
 * @access  Private (Manager and Admin)
 */
exports.updateAsset = async (req, res, next) => {
  try {
    const { name, type, category, quantity, status, location, purchase_date, notes } = req.body;

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Update fields
    if (name && name.trim()) asset.name = name.trim();
    if (type !== undefined) asset.type = type ? type.toLowerCase().trim() : 'other';
    if (category !== undefined) asset.category = category ? category.trim() : 'General';
    if (quantity !== undefined) {
      const parsedQty = parseInt(quantity, 10);
      if (!isNaN(parsedQty) && parsedQty >= 1) {
        asset.quantity = parsedQty;
      }
    }
    if (status && ['working', 'under_maintenance', 'not_working'].includes(status)) {
      asset.status = status;
    }
    if (location !== undefined) asset.location = location ? location.trim() : null;
    if (purchase_date !== undefined) asset.purchase_date = purchase_date ? new Date(purchase_date) : null;
    if (notes !== undefined) asset.notes = notes ? notes.trim() : null;

    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    next(error);
  }
};

/**
 * @desc    Update asset status
 * @route   PUT /api/assets/:id/status
 * @access  Private (Manager, Admin)
 */
exports.updateAssetStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['working', 'under_maintenance', 'not_working'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be working, under_maintenance, or not_working'
      });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const oldStatus = asset.status;
    asset.status = status;
    await asset.save();

    res.status(200).json({
      success: true,
      message: `Asset status updated from ${oldStatus} to ${status}`,
      data: asset
    });
  } catch (error) {
    console.error('Error updating asset status:', error);
    next(error);
  }
};

/**
 * @desc    Add service entry to asset
 * @route   POST /api/assets/:id/service
 * @access  Private (Manager, Admin)
 */
exports.logServiceEntry = async (req, res, next) => {
  try {
    const { description, done_by, date } = req.body;

    // Validate required fields
    if (!description || !done_by) {
      return res.status(400).json({
        success: false,
        message: 'Description and technician name (done_by) are required'
      });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Add service entry
    const serviceEntry = {
      date: date ? new Date(date) : new Date(),
      description: description.trim(),
      done_by: done_by.trim()
    };

    asset.services.push(serviceEntry);
    
    // last_service_date is automatically updated via pre-save hook in model
    await asset.save();

    res.status(201).json({
      success: true,
      message: 'Service entry added successfully',
      data: asset
    });
  } catch (error) {
    console.error('Error adding service entry:', error);
    next(error);
  }
};

/**
 * @desc    Delete an asset
 * @route   DELETE /api/assets/:id
 * @access  Private (Manager only)
 */
exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    next(error);
  }
};
