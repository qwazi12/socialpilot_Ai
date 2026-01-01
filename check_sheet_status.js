#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('📊 Checking your Google Sheet for test post...\n');

async function checkSheet() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'config/googleAuth.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

        // Get sheet data
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        const sheetName = spreadsheet.data.sheets[0].properties.title;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!A2:O2`
        });

        const row = response.data.values ? response.data.values[0] : [];

        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 Row 2 Current Status:');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`  ID: ${row[0] || '(empty)'}`);
        console.log(`  Video Name: ${row[1] || '(empty)'}`);
        console.log(`  Drive Link: ${row[2] || '❌ MISSING - Need to add!'}`);
        console.log(`  Title: ${row[3] || '(empty)'}`);
        console.log(`  Platforms: ${row[6] || '(empty)'}`);
        console.log(`  Status: ${row[7] || '(empty)'}`);
        console.log(`  Scheduled Time: ${row[8] || '(empty)'}`);
        console.log('\n═══════════════════════════════════════════════════════════\n');

        // Check what's missing
        const missing = [];
        if (!row[2] || row[2].includes('YOUR_DRIVE') || row[2].includes('PASTE')) {
            missing.push('❌ Drive Link (Column C) - Add your Google Drive video URL');
        }
        if (!row[6] || row[6] !== 'facebook,instagram') {
            missing.push('⚠️  Platforms (Column G) - Should be "facebook,instagram"');
        }
        if (!row[7]) {
            missing.push('⚠️  Status (Column H) - Add "scheduled" when ready to test');
        }

        if (missing.length > 0) {
            console.log('🛠️  ACTION NEEDED:\n');
            missing.forEach(item => console.log(`  ${item}`));
            console.log('\n📝 Update your sheet here:');
            console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
            console.log('\n💡 After updating, run: npm start');
        } else {
            console.log('✅ ALL READY!');
            if (row[7] === 'draft') {
                console.log('\n📝 Change Status (Column H) from "draft" to "scheduled"');
                console.log('   Then run: npm start');
            } else if (row[7] === 'scheduled') {
                console.log('\n🚀 Ready to post! Run: npm start');
            }
        }
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSheet();
