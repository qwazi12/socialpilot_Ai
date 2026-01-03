#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('🎬 Social Pilot AI - v2 Sheet Populator\n');

// Configuration - v2 Folders
const FOLDER_IDS = [
    '1z89MDt0UEeGBVSgJC6oHWXYccomI6ls_', // Folder 1
    '19ndyQxEXDMoOTzARx240AdKh2v2zizdf', // Folder 2
    '1rqUIlbpy_MR7Cm0FYCA5TmhECWIgWlIN'  // Folder 3
];

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

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
 * Fetch all video files from a Drive folder
 */
async function fetchVideosFromFolder(folderId, folderNumber) {
    try {
        console.log(`📂 Fetching videos from Folder ${folderNumber}...`);

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
        console.log(`   ✓ Found ${videos.length} videos in "${folderName}"`);

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
 * Create round-robin distribution from multiple folder arrays
 */
function createRoundRobinArray(folder1, folder2, folder3) {
    console.log('\n🔄 Creating round-robin distribution...');

    const maxLength = Math.max(
        folder1.length,
        folder2.length,
        folder3.length
    );

    const roundRobin = [];

    for (let i = 0; i < maxLength; i++) {
        if (folder1[i]) roundRobin.push(folder1[i]);
        if (folder2[i]) roundRobin.push(folder2[i]);
        if (folder3[i]) roundRobin.push(folder3[i]);
    }

    console.log(`   ✓ Total rows to create: ${roundRobin.length}`);
    return roundRobin;
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
 * Build sheet rows from video array
 */
function buildSheetRows(videos) {
    console.log('\n📝 Building sheet rows...');

    return videos.map(video => [
        video.fileId,                                              // ID
        video.fileName,                                            // Video Name
        `https://drive.google.com/file/d/${video.fileId}/view`,   // Drive Link
        formatTitle(video.fileName),                               // Title (formatted)
        '',                                                        // Description (blank)
        '',                                                        // Tags (blank)
        'Ready to post',                                           // Status
        `Source: ${video.folderName}`                              // Notes (folder name)
    ]);
}

/**
 * Get the sheet name dynamically or use v2
 */
async function getSheetName() {
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });

    // Check if v2 exists
    const v2Sheet = spreadsheet.data.sheets.find(s => s.properties.title === 'v2');
    if (v2Sheet) {
        return 'v2';
    }

    throw new Error('Sheet "v2" not found! Please create it first.');
}

/**
 * Write rows to Google Sheet
 */
async function writeToSheet(rows) {
    console.log('\n✨ Writing to Google Sheet...');

    const sheetName = await getSheetName();
    console.log(`   Sheet name: "${sheetName}"`);

    // Clear existing data (keep headers in row 1)
    console.log('   → Clearing existing data...');
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetName}'!A2:H`
    });

    // Write all rows starting from row 2
    console.log(`   → Writing ${rows.length} rows...`);
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetName}'!A2`,
        valueInputOption: 'RAW',
        resource: { values: rows }
    });

    console.log('   ✓ Sheet updated successfully!');
}

/**
 * Main execution
 */
async function main() {
    try {
        const startTime = Date.now();

        // Step 1: Fetch videos from all folders
        console.log('🔍 Step 1: Fetching videos from Drive folders...\n');
        const [folder1, folder2, folder3] = await Promise.all([
            fetchVideosFromFolder(FOLDER_IDS[0], 1),
            fetchVideosFromFolder(FOLDER_IDS[1], 2),
            fetchVideosFromFolder(FOLDER_IDS[2], 3)
        ]);

        const totalVideos = folder1.length + folder2.length + folder3.length;

        if (totalVideos === 0) {
            console.log('\n❌ No videos found in any folder!');
            console.log('   Make sure folders are shared with:');
            console.log('   socialpilot@sacred-archway-479713-u5.iam.gserviceaccount.com\n');
            return;
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Folder 1: ${folder1.length} videos`);
        console.log(`   Folder 2: ${folder2.length} videos`);
        console.log(`   Folder 3: ${folder3.length} videos`);
        console.log(`   Total: ${totalVideos} videos`);

        // Step 2: Create round-robin distribution
        const roundRobinVideos = createRoundRobinArray(folder1, folder2, folder3);

        // Step 3: Build sheet rows
        const sheetRows = buildSheetRows(roundRobinVideos);
        console.log(`   ✓ All fields populated`);

        // Step 4: Write to sheet
        await writeToSheet(sheetRows);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '═'.repeat(70));
        console.log('✅ SUCCESS! v2 Sheet populated in round-robin fashion');
        console.log('═'.repeat(70));
        console.log(`\n📊 Results:`);
        console.log(`   Total rows added: ${sheetRows.length}`);
        console.log(`   All statuses set to: "Ready to post"`);
        console.log(`   Description/Tags: Blank (fill in manually)`);
        console.log(`   Titles cleaned (removed video IDs)`);
        console.log(`   Duration: ${duration}s`);
        console.log(`\n📋 Google Sheet:`);
        console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
        console.log(`\n🎯 Next Steps:`);
        console.log(`   1. Open the v2 sheet`);
        console.log(`   2. Fill in Description and Tags for each video`);
        console.log(`   3. n8n will start posting (already "Ready to post")`);
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
