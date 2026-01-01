
const uploadService = require('../services/uploadPostService');

exports.getHistory = async (req, res) => {
  try {
    const history = await uploadService.getHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manualTrigger = async (req, res) => {
  // Middleware/Route level logic is handled in server.js for simplicity
};
