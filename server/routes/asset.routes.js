const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// GET /api/assets - Get all assets (All authenticated users: Manager, Admin, Resident, Watchman)
router.get('/', assetController.getAllAssets);

// GET /api/assets/:id - Get single asset (All authenticated users)
router.get('/:id', assetController.getAssetById);

// POST /api/assets - Create new asset (Manager, Admin)
router.post('/', authorize('manager', 'admin'), assetController.createAsset);

// PUT /api/assets/:id - Update asset details (Manager, Admin)
router.put('/:id', authorize('manager', 'admin'), assetController.updateAsset);

// PUT /api/assets/:id/status - Update asset status (Manager, Admin)
router.put('/:id/status', authorize('manager', 'admin'), assetController.updateAssetStatus);

// POST /api/assets/:id/service - Log service entry (Manager, Admin)
router.post('/:id/service', authorize('manager', 'admin'), assetController.logServiceEntry);

// DELETE /api/assets/:id - Delete asset (Manager only)
router.delete('/:id', authorize('manager'), assetController.deleteAsset);

module.exports = router;
