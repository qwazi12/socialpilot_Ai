
const { google } = require('googleapis');
const path = require('path');

// Authentication using Service Account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/googleAuth.json'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Extracts Google Drive ID and returns a readable stream
 */
exports.getFileStream = async (driveLink) => {
  try {
    // Regex to match file ID from standard Google Drive URLs
    const fileIdMatch = driveLink.match(/[-\w]{25,}/);
    if (!fileIdMatch) throw new Error('Invalid Google Drive URL: Could not extract File ID.');
    
    const fileId = fileIdMatch[0];
    console.log(`📥 Initiating stream for File ID: ${fileId}`);

    // Fetch the file as a stream
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    
    return response.data;
  } catch (error) {
    console.error('Google Drive Stream Error:', error.message);
    throw error;
  }
};
