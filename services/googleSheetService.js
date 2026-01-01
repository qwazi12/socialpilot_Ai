
const { google } = require('googleapis');
const path = require('path');
const logger = require('./loggerService');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/googleAuth.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Sheet1!A2:H';

/**
 * Reads scheduled rows from the sheet
 */
exports.getScheduledRows = async () => {
  try {
    logger.info('Attempting to read Google Sheet', { spreadsheetId: SPREADSHEET_ID, range: RANGE });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      logger.warn('Google Sheet is empty or no data found in range');
      return [];
    }

    logger.info(`Successfully retrieved ${rows.length} rows from sheet`);

    return rows.map((row, index) => ({
      rowIndex: index + 2,
      id: row[0],
      videoName: row[1],
      driveLink: row[2],
      title: row[3],
      platforms: row[4] ? row[4].split(',').map(p => p.trim()) : [],
      status: (row[5] || '').trim(),
      date: row[6],
      hour: row[7]
    }));
  } catch (error) {
    logger.error('Failed to read Google Sheet', { spreadsheetId: SPREADSHEET_ID }, error);
    throw error;
  }
};

/**
 * Updates status and notes columns for a specific row
 */
exports.updateRow = async (rowIndex, status, notes = '') => {
  try {
    const statusRange = `Sheet1!F${rowIndex}`;
    const notesRange = `Sheet1!I${rowIndex}`;

    logger.info(`Updating row ${rowIndex} status to: ${status}`, { notes });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: statusRange,
      valueInputOption: 'RAW',
      resource: { values: [[status]] },
    });

    if (notes) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: notesRange,
        valueInputOption: 'RAW',
        resource: { values: [[notes]] },
      });
    }
    
    logger.info(`Row ${rowIndex} updated successfully`);
  } catch (error) {
    logger.error(`Failed to update row ${rowIndex}`, { status, notes }, error);
  }
};
