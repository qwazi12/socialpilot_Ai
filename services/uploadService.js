
const axios = require('axios');
const FormData = require('form-data');
const logger = require('./loggerService');

const API_KEY = process.env.UPLOAD_POST_API_KEY;
const USER_ID = process.env.UPLOAD_POST_USER_ID;
const BASE_URL = 'https://api.upload-post.com/api';

/**
 * Posts video stream and metadata to the Upload-Post API
 */
exports.uploadVideo = async (videoStream, { title, platforms }) => {
  const form = new FormData();
  
  form.append('user', USER_ID);
  form.append('video', videoStream, { filename: 'content.mp4' });
  form.append('title', title);
  
  platforms.forEach(p => {
    form.append('platform[]', p.toLowerCase().trim());
  });

  logger.info(`Initiating API upload for: "${title}"`, { platforms, userId: USER_ID });

  try {
    const response = await axios.post(`${BASE_URL}/upload`, form, {
      headers: {
        'Authorization': `ApiKey ${API_KEY}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    logger.info(`API Upload successful for: "${title}"`, { apiId: response.data.id });
    return response.data;
  } catch (error) {
    const errorData = error.response ? error.response.data : 'No response body';
    const status = error.response ? error.response.status : 'No status';
    
    const context = {
      title,
      platforms,
      httpStatus: status,
      apiResponse: errorData
    };

    logger.error(`Upload-Post API failure for: "${title}"`, context, error);
    
    // Construct a detailed message for the Google Sheet
    const errorMessage = error.response 
      ? `API Error (${status}): ${JSON.stringify(errorData).substring(0, 100)}` 
      : `Network Error: ${error.message}`;
      
    throw new Error(errorMessage);
  }
};
