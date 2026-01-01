const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/googleAuth.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Sheet1!A2:M'; // Reads columns A through M

exports.getScheduledRows = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.map((row, index) => {
      // Parser for "Scheduled Time" (Column I / Index 8)
      // Expected Format in Sheet: "2025-01-01 14:00"
      let date = '';
      let hour = '';

      if (row[8]) {
        const dateTime = new Date(row[8]);
        if (!isNaN(dateTime)) {
          date = dateTime.toISOString().split('T')[0]; // "2025-01-01"
          hour = dateTime.getHours(); // 14
        }
      }

      return {
        index: index + 2, // Row number (1-based)
        id: row[0],
        driveLink: row[2],
        title: row[3],
        description: row[4], // New: Description
        tags: row[5],        // New: Tags
        platforms: row[6],   // New: Platforms is now Col G
        status: row[7],      // New: Status is Col H
        date: date,
        hour: hour
      };
    });
  } catch (error) {
    console.error('Sheet Read Error:', error.message);
    return [];
  }
};

exports.updateRow = async (rowIndex, status, notes, url = '') => {
  try {
    // Update Status (Col H), YouTube URL (Col J), and Notes (Col M)
    // We do three separate updates to avoid overwriting other columns

    // 1. Update Status (H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!H${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[status]] },
    });

    // 2. Update Notes (M)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!M${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[notes]] },
    });

    // 3. If we have a URL, Update YouTube URL (J)
    if (url) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!J${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[url]] },
      });
    }

  } catch (error) {
    console.error('Sheet Update Error:', error.message);
  }
};
