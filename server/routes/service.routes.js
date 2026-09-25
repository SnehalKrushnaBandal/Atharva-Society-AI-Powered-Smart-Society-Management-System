const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Public (all authenticated roles) routes
router.get('/emergency-contacts', serviceController.getEmergencyContacts);
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Manager & Admin management routes
router.post('/', authorize('manager', 'admin'), serviceController.createService);
router.put('/:id', authorize('manager', 'admin'), serviceController.updateService);
router.delete('/:id', authorize('manager', 'admin'), serviceController.deleteService);

module.exports = router;
