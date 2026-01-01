
require('dotenv').config();
const express = require('express');
const scheduler = require('./cron/scheduler');

const app = express();
app.use(express.json());

// Start the Cron Job
scheduler.start();

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SocialPilot Headless Automation Bot is running.',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Automation Server listening on port ${PORT}`);
});
