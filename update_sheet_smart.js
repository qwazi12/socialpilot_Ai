#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('🎬 Social Pilot AI - Smart Update Script\n');

// Configuration
const FOLDER_IDS = [
    '1ktVqtMvjJqFFWgI1qfVk9lsidL4j4ThG', // Folder 1
    '1LAuaHflIR6wDz_Q_HAyM3czISybNQ0qr', // Folder 2
    '1qmw-YSslPxW_ui5tTdFwoaGlGo0F3ouq', // Folder 3
    '1M7QblJFkwSqiqQ87zUECzFR8JBP5YJqD'  // Folder 4
];

const DESCRIPTION_TEMPLATE = `Do you remember this scene? Comment the movie or show title below 👇
#screencentral #movieclips #tvclips #moviescene #tvscene #cinematic #movietok #shorts`;

const TAGS = 'screencentral, movieclips, tvclips, moviescene, tvscene, cinematic, movietok, shorts, reels';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const MAIN_SHEET_NAME = 'v1';
const ARCHIVE_SHEET_NAME = 'Posted Videos';

// Initialize Google APIs
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'config/googleAuth.json'),
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
    ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

/**
 * Get or create a sheet by name
 */
async function ensureSheetExists(sheetName) {
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });

    const sheet = spreadsheet.data.sheets.find(
        s => s.properties.title === sheetName
    );

    if (!sheet) {
        console.log(`📄 Creating new sheet: "${sheetName}"`);
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: { title: sheetName }
                    }
                }]
            }
        });

        // Add headers
        const headers = [['ID', 'Video Name', 'Drive Link', 'Title', 'Description', 'Tags', 'Status', 'Notes']];
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!A1:H1`,
            valueInputOption: 'RAW',
            resource: { values: headers }
        });

        console.log(`   ✓ Sheet created with headers`);
    }

    return sheetName;
}

/**
 * Read all rows from a sheet
 */
async function readSheet(sheetName) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!A2:H`  // Skip header row
        });

        const rows = response.data.values || [];
        return rows.map((row, index) => ({
            rowNumber: index + 2,
            fileId: row[0] || '',
            fileName: row[1] || '',
            driveLink: row[2] || '',
            title: row[3] || '',
            description: row[4] || '',
            tags: row[5] || '',
            status: row[6] || '',
            notes: row[7] || ''
        }));
    } catch (error) {
        if (error.message.includes('Unable to parse range')) {
            return [];
        }
        throw error;
    }
}

/**
 * Fetch all video files from a Drive folder
 */
async function fetchVideosFromFolder(folderId, folderNumber) {
    try {
        // Get folder name
        const folderInfo = await drive.files.get({
            fileId: folderId,
            fields: 'name'
        });
        const folderName = folderInfo.data.name;

        // Get videos in folder
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false and (mimeType contains 'video/' or name contains '.mp4' or name contains '.mov' or name contains '.avi')`,
            fields: 'files(id, name)',
            orderBy: 'name'
        });

        const videos = response.data.files || [];

        return videos.map(file => ({
            fileId: file.id,
            fileName: file.name,
            folderNumber: folderNumber,
            folderName: folderName
        }));
    } catch (error) {
        console.error(`   ❌ Error accessing Folder ${folderNumber}:`, error.message);
        return [];
    }
}

/**
 * Format filename into clean title
 */
function formatTitle(filename) {
    let title = filename.replace(/\.[^/.]+$/, '');
    title = title.replace(/\s*\[?[a-zA-Z0-9]{10,}\]?\s*$/g, '');
    title = title.replace(/[_-]*(v?\d+|final|copy|edit|updated|new|draft|test)\s*$/gi, '');
    title = title.replace(/[_-]+/g, ' ');
    title = title.replace(/\s+/g, ' ').trim();
    title = title.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    return title;
}

/**
 * Create round-robin distribution
 */
function createRoundRobinArray(folder1, folder2, folder3, folder4) {
    const maxLength = Math.max(
        folder1.length,
        folder2.length,
        folder3.length,
        folder4.length
    );

    const roundRobin = [];
    for (let i = 0; i < maxLength; i++) {
        if (folder1[i]) roundRobin.push(folder1[i]);
        if (folder2[i]) roundRobin.push(folder2[i]);
        if (folder3[i]) roundRobin.push(folder3[i]);
        if (folder4[i]) roundRobin.push(folder4[i]);
    }

    return roundRobin;
}

/**
 * Build row array for sheet
 */
function buildRow(video) {
    return [
        video.fileId,
        video.fileName,
        `https://drive.google.com/file/d/${video.fileId}/view`,
        formatTitle(video.fileName),
        DESCRIPTION_TEMPLATE,
        TAGS,
        'Review',
        `Source: ${video.folderName}`
    ];
}

/**
 * Main execution
 */
async function main() {
    try {
        const startTime = Date.now();

        console.log('🔍 Step 1: Reading existing sheets...\n');

        // Ensure both sheets exist
        await ensureSheetExists(MAIN_SHEET_NAME);
        await ensureSheetExists(ARCHIVE_SHEET_NAME);

        // Read existing data
        const mainRows = await readSheet(MAIN_SHEET_NAME);
        const archiveRows = await readSheet(ARCHIVE_SHEET_NAME);

        console.log(`   Main sheet: ${mainRows.length} rows`);
        console.log(`   Archive sheet: ${archiveRows.length} rows`);

        // Categorize existing rows
        const postedRows = mainRows.filter(r => r.status === 'Posted');
        const readyRows = mainRows.filter(r => r.status === 'Ready to post');

        // Track all existing file IDs (from both sheets)
        const existingFileIds = new Set([
            ...mainRows.map(r => r.fileId),
            ...archiveRows.map(r => r.fileId)
        ]);

        console.log(`\n📊 Current status:`);
        console.log(`   Posted (to archive): ${postedRows.length}`);
        console.log(`   Ready to post (preserve): ${readyRows.length}`);
        console.log(`   Total tracked IDs: ${existingFileIds.size}`);

        // Step 2: Archive posted videos
        if (postedRows.length > 0) {
            console.log(`\n📦 Step 2: Archiving ${postedRows.length} posted videos...`);

            const archiveData = postedRows.map(row => [
                row.fileId,
                row.fileName,
                row.driveLink,
                row.title,
                row.description,
                row.tags,
                row.status,
                row.notes
            ]);

            // Append to archive
            const archiveRange = `'${ARCHIVE_SHEET_NAME}'!A${archiveRows.length + 2}`;
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: archiveRange,
                valueInputOption: 'RAW',
                resource: { values: archiveData }
            });

            console.log(`   ✓ Archived to "${ARCHIVE_SHEET_NAME}"`);
        }

        // Step 3: Fetch videos from Drive
        console.log(`\n🔍 Step 3: Fetching videos from Drive folders...\n`);

        const [folder1, folder2, folder3, folder4] = await Promise.all([
            fetchVideosFromFolder(FOLDER_IDS[0], 1),
            fetchVideosFromFolder(FOLDER_IDS[1], 2),
            fetchVideosFromFolder(FOLDER_IDS[2], 3),
            fetchVideosFromFolder(FOLDER_IDS[3], 4)
        ]);

        const allDriveVideos = [...folder1, ...folder2, ...folder3, ...folder4];

        console.log(`\n📊 Drive Summary:`);
        console.log(`   Folder 1: ${folder1.length} videos`);
        console.log(`   Folder 2: ${folder2.length} videos`);
        console.log(`   Folder 3: ${folder3.length} videos`);
        console.log(`   Folder 4: ${folder4.length} videos`);
        console.log(`   Total: ${allDriveVideos.length} videos`);

        // Step 4: Filter for new videos only
        const newVideos = allDriveVideos.filter(v => !existingFileIds.has(v.fileId));

        console.log(`\n🆕 New videos found: ${newVideos.length}`);

        // Step 5: Round-robin distribution for new videos
        if (newVideos.length > 0) {
            console.log(`\n🔄 Step 4: Applying round-robin to new videos...`);

            const newByFolder = {
                folder1: newVideos.filter(v => v.folderNumber === 1),
                folder2: newVideos.filter(v => v.folderNumber === 2),
                folder3: newVideos.filter(v => v.folderNumber === 3),
                folder4: newVideos.filter(v => v.folderNumber === 4)
            };

            const roundRobinNew = createRoundRobinArray(
                newByFolder.folder1,
                newByFolder.folder2,
                newByFolder.folder3,
                newByFolder.folder4
            );

            console.log(`   ✓ ${roundRobinNew.length} videos in round-robin order`);

            // Step 6: Build final main sheet
            console.log(`\n✨ Step 5: Updating main sheet...`);

            const newRows = roundRobinNew.map(v => buildRow(v));
            const readyRowsData = readyRows.map(r => [
                r.fileId, r.fileName, r.driveLink, r.title,
                r.description, r.tags, r.status, r.notes
            ]);

            const finalMainData = [
                ...readyRowsData,  // Ready to post first
                ...newRows         // New reviews after
            ];

            // Clear and rewrite main sheet
            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${MAIN_SHEET_NAME}'!A2:H`
            });

            if (finalMainData.length > 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `'${MAIN_SHEET_NAME}'!A2`,
                    valueInputOption: 'RAW',
                    resource: { values: finalMainData }
                });
            }

            console.log(`   ✓ Main sheet updated`);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '═'.repeat(70));
        console.log('✅ SMART UPDATE COMPLETE!');
        console.log('═'.repeat(70));
        console.log(`\n📊 Summary:`);
        console.log(`   📦 Archived: ${postedRows.length} posted videos`);
        console.log(`   ✅ Preserved: ${readyRows.length} ready-to-post videos`);
        console.log(`   🆕 Added: ${newVideos.length} new videos`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log(`\n📋 Sheets:`);
        console.log(`   Main ("${MAIN_SHEET_NAME}"): ${readyRows.length + newVideos.length} rows`);
        console.log(`   Archive ("${ARCHIVE_SHEET_NAME}"): ${archiveRows.length + postedRows.length} rows`);
        console.log(`\n🎯 Next:`);
        console.log(`   1. Review new videos in main sheet`);
        console.log(`   2. Change Status to "Ready to post" when ready`);
        console.log(`   3. n8n will handle posting`);
        console.log(`   4. Run this script again to archive posted videos`);
        console.log('');

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

main();
