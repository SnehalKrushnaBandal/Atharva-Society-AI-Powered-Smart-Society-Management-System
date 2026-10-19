const { getAuthorizedContext } = require('../services/aiContext.service');
const { generateSocietyAiResponse } = require('../services/ai.service');

/**
 * @desc    Process user chat prompt with Atharva Society AI Assistant
 * @route   POST /api/ai/chat
 * @access  Private (Authenticated users: resident, owner, tenant, manager, admin, watchman)
 */
const chatWithAi = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message prompt is required and must be non-empty.',
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message prompt cannot exceed 1000 characters.',
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // 1. Gather role-isolated authorized context
    const contextData = await getAuthorizedContext(user);

    // 2. Call Groq AI service
    const reply = await generateSocietyAiResponse(message.trim(), history || [], contextData);

    return res.status(200).json({
      success: true,
      data: {
        reply,
        role: user.role,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('AI Controller Error:', error.message);

    if (error.code === 'GROQ_KEY_MISSING' || error.code === 'GROQ_AUTH_ERROR') {
      return res.status(503).json({
        success: false,
        message: 'Groq AI service is not configured. Please set GROQ_API_KEY in server environment variables.',
      });
    }

    if (error.code === 'GROQ_RATE_LIMIT') {
      return res.status(429).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process AI assistant request. ' + (error.message || ''),
    });
  }
};

module.exports = {
  chatWithAi,
};
