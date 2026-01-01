#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('📝 Updating sheet for Facebook, TikTok, Instagram, YouTube...\n');

async function updatePlatforms() {
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

        // Update example row with your main platforms
        console.log('Updating Row 2 with your main platforms...');
        const updatedRow = [[
            '1',
            'test-video.mp4',
            'YOUR_DRIVE_LINK_HERE',
            'My First Multi-Platform Post!',
            'This video will be posted to all my main platforms at once. Check out this amazing content!',
            'viral,trending,content',
            'facebook,tiktok,instagram,youtube',  // Your main platforms
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
            resource: { values: updatedRow }
        });

        console.log('✅ Updated!\n');
        console.log('📊 Your Sheet: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit\n');
        console.log('🎯 Row 2 now shows: facebook,tiktok,instagram,youtube\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updatePlatforms();
