const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Public read routes for all authenticated roles
router.get('/', noticeController.getAllNotices);
router.get('/:id', noticeController.getNoticeById);

// Manager & Admin write routes
router.post('/', authorize('manager', 'admin'), noticeController.createNotice);
router.put('/:id', authorize('manager', 'admin'), noticeController.updateNotice);
router.delete('/:id', authorize('manager', 'admin'), noticeController.deleteNotice);
router.patch('/:id/pin', authorize('manager', 'admin'), noticeController.togglePinNotice);

module.exports = router;
