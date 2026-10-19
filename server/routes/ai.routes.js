const express = require('express');
const router = express.Router();
const { chatWithAi } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

// @route   POST /api/ai/chat
// @desc    Send prompt to Groq AI Assistant with authorized context
// @access  Private (Authenticated Users)
router.post('/chat', authenticate, chatWithAi);

module.exports = router;
