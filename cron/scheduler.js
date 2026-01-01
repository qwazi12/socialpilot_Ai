
const cron = require('node-cron');
const googleSheetService = require('../services/googleSheetService');
const driveService = require('../services/driveService');
const uploadService = require('../services/uploadService');
const logger = require('../services/loggerService');

/**
 * Core automation logic
 */
const runJob = async () => {
  const startTime = Date.now();
  logger.info('--- Automation Run Started ---');

  let processedCount = 0;
  let successCount = 0;
  let failureCount = 0;

  try {
    const rows = await googleSheetService.getScheduledRows();
    const now = new Date();

    for (const row of rows) {
      if (row.status.toLowerCase() === 'scheduled') {
        const scheduledTimeStr = `${row.date}T${row.hour}:00`;
        const scheduledDate = new Date(scheduledTimeStr);

        if (scheduledDate <= now) {
          processedCount++;
          logger.info(`Processing due post: "${row.title}"`, { index: row.index, scheduledTime: scheduledTimeStr });

          try {
            // 1. Get readable stream from Drive
            const videoStream = await driveService.getFileStream(row.driveLink);

            // 2. Upload to Social Platforms
            const result = await uploadService.uploadVideo(videoStream, {
              title: row.title,
              description: row.description,
              tags: row.tags,
              platforms: row.platforms
            });

            // 3. Update Sheet on Success with URL
            // This assumes the API returns a 'url' field. 
            // If it only returns an ID, we construct the link.
            const postUrl = result.url || `https://upload-post.com/view/${result.id}`;

            await googleSheetService.updateRow(row.index, 'Posted', 'Auto-posted successfully', postUrl);
            successCount++;

          } catch (error) {
            // 4. Update Sheet on Failure
            await googleSheetService.updateRow(row.index, 'Failed', error.message);
            failureCount++;
            logger.warn(`Post failed for "${row.title}"`, { index: row.index, error: error.message });
          }
        }
      }
    }
  } catch (error) {
    logger.error('Critical Error during cron execution', {}, error);
  } finally {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`--- Automation Run Completed ---`, {
      durationSeconds: duration,
      totalProcessed: processedCount,
      successes: successCount,
      failures: failureCount
    });
  }
};

/**
 * Start the node-cron scheduler
 */
exports.start = () => {
  cron.schedule('0 * * * *', runJob);
  logger.info('Cron Scheduler initialized (Hourly cycle)');
};
