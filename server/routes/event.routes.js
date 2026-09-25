const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Public read routes for all authenticated roles
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Manager & Admin write routes
router.post('/', authorize('manager', 'admin'), eventController.createEvent);
router.put('/:id', authorize('manager', 'admin'), eventController.updateEvent);
router.delete('/:id', authorize('manager', 'admin'), eventController.deleteEvent);

module.exports = router;
