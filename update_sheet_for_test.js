#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('📝 Updating Google Sheet with video link...\n');

async function updateSheet() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'config/googleAuth.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        const sheetName = spreadsheet.data.sheets[0].properties.title;

        // Update Drive Link in Column C
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!C2`,
            valueInputOption: 'RAW',
            resource: { values: [['https://drive.google.com/file/d/1dah7xbjuJlpmrYywOVpWJd5Ito231SDn/view?usp=drive_link']] }
        });

        console.log('✅ Drive link added to Column C!\n');
        console.log('Video: "Something Worse Than Pinkeye.mp4"\n');

        // Update Status to 'scheduled'
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!H2`,
            valueInputOption: 'RAW',
            resource: { values: [['scheduled']] }
        });

        console.log('✅ Status changed to "scheduled"!\n');

        // Update scheduled time to past (for immediate testing)
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!I2`,
            valueInputOption: 'RAW',
            resource: { values: [['2026-01-01 10:00']] }
        });

        console.log('✅ Scheduled time set to past (will post immediately)!\n');

        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎉 READY TO TEST!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('Row 2 is now configured:');
        console.log('  ✓ Drive Link: Added');
        console.log('  ✓ Platforms: facebook,instagram');
        console.log('  ✓ Status: scheduled');
        console.log('  ✓ Time: 2026-01-01 10:00 (past - will post now)\n');
        console.log('Next: Starting the bot...\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateSheet();
