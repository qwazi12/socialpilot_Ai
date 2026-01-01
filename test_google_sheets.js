#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

console.log('🧪 Testing Google Sheets Connection...\n');

// Check environment variables
console.log('📋 Configuration Check:');
console.log(`  GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID ? '✓ Set' : '✗ Missing'}`);
console.log(`  Credentials file: ${path.join(__dirname, 'config/googleAuth.json')}`);
console.log('');

async function testConnection() {
    try {
        // Authenticate
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'config/googleAuth.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

        console.log('🔑 Authenticating with service account...');
        const authClient = await auth.getClient();
        const serviceAccount = authClient.email;
        console.log(`  ✓ Service Account: ${serviceAccount}\n`);

        // Test read
        console.log('📖 Testing read access...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1:M1',
        });

        const headers = response.data.values;
        if (headers && headers.length > 0) {
            console.log(`  ✓ Successfully read headers:`);
            console.log(`    Columns: ${headers[0].join(', ')}`);
            console.log(`    Total columns: ${headers[0].length}`);
        } else {
            console.log('  ⚠️  No headers found. Is your sheet empty?');
        }

        // Test write (add timestamp to a test cell)
        console.log('\n📝 Testing write access...');
        const timestamp = new Date().toISOString();
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!N1',
            valueInputOption: 'RAW',
            resource: { values: [[`Test: ${timestamp}`]] },
        });
        console.log('  ✓ Successfully wrote test data to cell N1');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ SUCCESS! Google Sheets integration is working!');
        console.log('='.repeat(60));
        console.log('\n📊 Your Google Sheet:');
        console.log(`  https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
        console.log('\n🎯 Next Steps:');
        console.log('  1. Link your social media accounts: npm run setup');
        console.log('  2. Add a test post to your Google Sheet');
        console.log('  3. Start the bot: npm start');
        console.log('');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);

        if (error.message.includes('ENOENT')) {
            console.error('\n💡 Fix: config/googleAuth.json file not found');
        } else if (error.message.includes('invalid_grant')) {
            console.error('\n💡 Fix: Service account credentials may be invalid');
        } else if (error.message.includes('permission')) {
            console.error('\n💡 Fix: Make sure the sheet is shared with:');
            console.error('   socialpilot@sacred-archway-479713-u5.iam.gserviceaccount.com');
        }

        process.exit(1);
    }
}

testConnection();
