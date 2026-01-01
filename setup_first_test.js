#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('🎬 Setting up your first test post (Facebook + Instagram)...\n');

async function setupTestPost() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'config/googleAuth.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

        // Get sheet name
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        const sheetName = spreadsheet.data.sheets[0].properties.title;

        console.log('📝 Updating Row 2 with test post data...\n');

        // Facebook Page ID from URL: 61584658181845
        const testRow = [[
            '1',
            'test-video.mp4',
            'PASTE_YOUR_VIDEO_LINK_HERE',  // You'll need to get a specific video file link
            '🎉 First Test Post from Social Pilot AI!',
            'Testing my automated posting system. This is going to Facebook and Instagram simultaneously!',
            'test,automation,firstpost',
            'facebook,instagram',  // Testing FB and IG only
            'draft',  // Change to 'scheduled' when ready to test
            '2026-01-01 14:00',
            '',
            '',
            '',
            '',
            ''
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!A2:O2`,
            valueInputOption: 'RAW',
            resource: { values: testRow }
        });

        console.log('✅ Test row updated!\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📊 Your Google Sheet:');
        console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('📋 Test Post Configuration:');
        console.log('   Platforms: Facebook + Instagram');
        console.log('   Status: draft (change to "scheduled" when ready)');
        console.log('   Video: You need to add the Drive link\n');

        console.log('🎯 Next Steps:\n');

        console.log('1️⃣  SHARE DRIVE FOLDER WITH SERVICE ACCOUNT');
        console.log('   Folder: https://drive.google.com/drive/u/5/folders/19ndyQxEXDMoOTzARx240AdKh2v2zizdf');
        console.log('   → Right-click folder → Share');
        console.log('   → Add: socialpilot@sacred-archway-479713-u5.iam.gserviceaccount.com');
        console.log('   → Give "Viewer" permission\n');

        console.log('2️⃣  GET VIDEO FILE LINK');
        console.log('   → Open the folder, pick your test video');
        console.log('   → Right-click video → Get link');
        console.log('   → Copy the link');
        console.log('   → Paste in Column C (Drive Link) in your sheet\n');

        console.log('3️⃣  LINK FACEBOOK & INSTAGRAM ACCOUNTS');
        console.log('   Run: npm run setup');
        console.log('   → Visit the URL provided');
        console.log('   → Connect Facebook Page (ID: 61584658181845)');
        console.log('   → Connect Instagram account\n');

        console.log('4️⃣  UPDATE SHEET & TEST');
        console.log('   → Change Column H (Status) from "draft" to "scheduled"');
        console.log('   → Change Column I (Scheduled Time) to past time');
        console.log('   → Example: 2026-01-01 10:00\n');

        console.log('5️⃣  START THE BOT');
        console.log('   Run: npm start');
        console.log('   → Bot will detect the scheduled post');
        console.log('   → Download video from Drive');
        console.log('   → Post to Facebook & Instagram');
        console.log('   → Update sheet with URLs and status\n');

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('💡 TIP: Check Column O (Notes) for success/error messages');
        console.log('═══════════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupTestPost();
