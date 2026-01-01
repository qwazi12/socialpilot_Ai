
const axios = require('axios');
const FormData = require('form-data');

const API_KEY = process.env.UPLOAD_POST_API_KEY;
const USER_ID = process.env.UPLOAD_POST_USER_ID;
const BASE_URL = 'https://api.upload-post.com/api';

/**
 * Performs a multipart upload of the video stream to the distribution API
 */
exports.uploadVideo = async (videoStream, postData) => {
  const form = new FormData();
  form.append('user', USER_ID);
  form.append('video', videoStream);
  form.append('title', postData.title);
  
  // Platform array expansion
  postData.platforms.forEach(platform => {
    form.append('platform[]', platform.toLowerCase());
  });

  if (postData.description) form.append('description', postData.description);

  try {
    const response = await axios.post(`${BASE_URL}/upload`, form, {
      headers: {
        'Authorization': `Apikey ${API_KEY}`,
        ...form.getHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Upload-Post API Error:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Fetches the user's posting history from the API
 */
exports.getHistory = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/uploadposts/history`, {
      headers: { 'Authorization': `Apikey ${API_KEY}` }
    });
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
};
