
require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.UPLOAD_POST_API_KEY;
const USER_ID = process.env.UPLOAD_POST_USER_ID;
const BASE_URL = 'https://api.upload-post.com/api';

async function performSetup() {
  console.log('🛠️ Starting SocialPilot Bot Setup...');

  if (!API_KEY || !USER_ID) {
    console.error('❌ Error: Missing UPLOAD_POST_API_KEY or UPLOAD_POST_USER_ID in .env');
    process.exit(1);
  }

  try {
    // Step 1: Ensure User exists
    console.log(`👤 Registering user profile: ${USER_ID}`);
    await axios.post(`${BASE_URL}/uploadposts/users`, {
      username: USER_ID
    }, {
      headers: { 'Authorization': `ApiKey ${API_KEY}` }
    }).catch(err => {
      // If user exists (409), we continue
      if (err.response && err.response.status === 409) {
        console.log('ℹ️ User profile already exists. Continuing...');
      } else {
        throw err;
      }
    });

    // Step 2: Generate linking session
    console.log('🔗 Generating account linking session...');
    const response = await axios.post(`${BASE_URL}/uploadposts/users/generate-jwt`, {
      username: USER_ID
    }, {
      headers: { 'Authorization': `ApiKey ${API_KEY}` }
    });

    const access_url = response.data.access_url;

    console.log(`
    ================================================================
    ✅ SETUP READY
    ================================================================
    User profile "${USER_ID}" is verified.
    
    URGENT: To connect your TikTok, YouTube, or Instagram accounts,
    please visit the following URL in your browser:
    
    ${access_url}
    
    Once linked, the bot will be able to distribute content to them.
    ================================================================
    `);

  } catch (error) {
    console.error('❌ Setup Error:', error.response ? JSON.stringify(error.response.data) : error.message);
  }
}

performSetup();
