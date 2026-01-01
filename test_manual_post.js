#!/usr/bin/env node
// Manual trigger for testing - runs the scheduler immediately

require('dotenv').config();
const googleSheetService = require('./services/googleSheetService');
const driveService = require('./services/driveService');
const uploadService = require('./services/uploadService');
const logger = require('./services/loggerService');

async function runManualTest() {
    console.log('🎬 Running manual test post...\n');
    const startTime = Date.now();

    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;

    try {
        const rows = await googleSheetService.getScheduledRows();
        const now = new Date();

        console.log(`Found ${rows.length} rows in sheet\n`);

        for (const row of rows) {
            console.log(`Row ${row.index}: Status="${row.status}", Platforms="${row.platforms}"`);

            if (row.status && row.status.toLowerCase() === 'scheduled') {
                const scheduledTimeStr = `${row.date}T${row.hour}:00`;
                const scheduledDate = new Date(scheduledTimeStr);

                console.log(`  Scheduled for: ${scheduledTimeStr}`);
                console.log(`  Current time: ${now.toISOString()}`);

                if (scheduledDate <= now) {
                    processedCount++;
                    console.log(`\n✅ Processing: "${row.title}"`);
                    console.log(`   Drive Link: ${row.driveLink}`);
                    console.log(`   Platforms: ${row.platforms}`);

                    try {
                        // 1. Get readable stream from Drive
                        console.log('   📥 Downloading from Drive...');
                        const videoStream = await driveService.getFileStream(row.driveLink);
                        console.log('   ✓ Downloaded!');

                        // 2. Upload to Social Platforms
                        console.log('   📤 Uploading to platforms...');
                        const result = await uploadService.uploadVideo(videoStream, {
                            title: row.title,
                            description: row.description,
                            tags: row.tags,
                            platforms: row.platforms
                        });
                        console.log('   ✓ Uploaded!');
                        console.log('   Result:', JSON.stringify(result, null, 2));

                        // 3. Update Sheet on Success
                        const postUrl = result.url || `Posted successfully`;
                        await googleSheetService.updateRow(row.index, 'Posted', 'Auto-posted successfully', postUrl);
                        successCount++;
                        console.log(`   ✅ Posted successfully!\n`);

                    } catch (error) {
                        // 4. Update Sheet on Failure
                        await googleSheetService.updateRow(row.index, 'Failed', error.message);
                        failureCount++;
                        console.log(`   ❌ Failed: ${error.message}\n`);
                    }
                } else {
                    console.log(`  ⏸️  Not yet time (scheduled for future)\n`);
                }
            } else {
                console.log(`  ⏭️  Skipping (status is not "scheduled")\n`);
            }
        }
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    } finally {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log(`📊 Test Complete - Duration: ${duration}s`);
        console.log(`   Processed: ${processedCount}`);
        console.log(`   Success: ${successCount}`);
        console.log(`   Failed: ${failureCount}`);
        console.log('═══════════════════════════════════════════════════════════\n');
    }
}

runManualTest();
