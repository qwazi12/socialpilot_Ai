#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('📝 Setting all non-Posted items to "Ready to post"...\n');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'config/googleAuth.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function setAllToReady() {
    // Read current data
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'v1!A2:H'
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
        console.log('No rows to update.');
        return;
    }

    let updatedCount = 0;
    const updates = [];

    // For each row, if status is NOT "Posted", change to "Ready to post"
    rows.forEach((row, index) => {
        const currentStatus = row[6] || ''; // Column G (Status)

        if (currentStatus !== 'Posted') {
            updates.push({
                range: `v1!G${index + 2}`,
                values: [['Ready to post']]
            });
            updatedCount++;
        }
    });

    if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                data: updates,
                valueInputOption: 'RAW'
            }
        });
    }

    console.log(`✅ Updated ${updatedCount} rows to "Ready to post"`);
    console.log(`   Skipped ${rows.length - updatedCount} Posted items\n`);
}

setAllToReady();
