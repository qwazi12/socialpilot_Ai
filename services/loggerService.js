
/**
 * Simple Logger Service
 * In a production environment, this would pipe to a file (using winston/pino)
 * or an external service like Datadog/Sentry.
 */
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/automation.log');

// Ensure log directory exists (if running in a node env that allows fs)
try {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
} catch (e) {
  // Silent fail if filesystem is restricted
}

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
};

const logToFile = (msg) => {
  try {
    fs.appendFileSync(LOG_FILE, msg + '\n');
  } catch (e) {
    // Fallback to console if file writing fails
  }
};

const logger = {
  info: (msg, meta) => {
    const formatted = formatMessage('info', msg, meta);
    console.log(formatted);
    logToFile(formatted);
  },
  warn: (msg, meta) => {
    const formatted = formatMessage('warn', msg, meta);
    console.warn(formatted);
    logToFile(formatted);
  },
  error: (msg, meta, error) => {
    const errorDetails = error ? ` | Stack: ${error.stack}` : '';
    const formatted = formatMessage('error', msg, meta) + errorDetails;
    console.error(formatted);
    logToFile(formatted);
  }
};

module.exports = logger;
