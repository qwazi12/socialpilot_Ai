#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('📊 Setting up Google Sheet...\n');

async function setupSheet() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'config/googleAuth.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

        console.log('🔑 Authenticating...');
        const authClient = await auth.getClient();
        console.log(` ✓ Connected as: ${authClient.email}\n`);

        // Get spreadsheet info to find sheet name
        console.log('📋 Getting sheet information...');
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });

        const firstSheet = spreadsheet.data.sheets[0];
        const sheetName = firstSheet.properties.title;
        console.log(`  ✓ Found sheet: "${sheetName}"\n`);

        // Add headers
        console.log('📝 Adding column headers...');
        const headers = [[
            'ID', 'Video Name', 'Drive Link', 'Title', 'Description', 'Tags',
            'Platforms', 'Status', 'Scheduled Time', 'YouTube URL',
            'Instagram URL', 'TikTok URL', 'Notes'
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!A1:M1`,
            valueInputOption: 'RAW',
            resource: { values: headers }
        });
        console.log('  ✓ Headers added!\n');

        // Add example row
        console.log('📋 Adding example test row...');
        const exampleRow = [[
            '1',
            'test-video.mp4',
            'YOUR_DRIVE_LINK_HERE',
            'My First Test Post',
            'This is a test description',
            'test,automation',
            'tiktok',
            'draft',
            '2026-01-02 14:00',
            '',
            '',
            '',
            ''
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!A2:M2`,
            valueInputOption: 'RAW',
            resource: { values: exampleRow }
        });
        console.log('  ✓ Example row added!\n');

        console.log('='.repeat(70));
        console.log('✅ SUCCESS! Google Sheet is configured!');
        console.log('='.repeat(70));
        console.log(`\n📊 Your Sheet:  https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
        console.log(`\n✓ Sheet has 13 columns (A-M) with proper headers`);
        console.log(`✓ Example test row added (Row 2)`);
        console.log(`\n🎯 Next Steps:`);
        console.log(`  1. Link social accounts: npm run setup`);
        console.log(`  2. Update Row 2 with real Google Drive video link`);
        console.log(`  3. Change status to "scheduled" when ready`);
        console.log(`  4. Start bot: npm start\n`);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

setupSheet();
