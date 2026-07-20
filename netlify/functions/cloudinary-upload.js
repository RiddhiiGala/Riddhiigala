// Netlify Function: Cloudinary Upload Handler
// Securely uploads photos to Cloudinary from the backend

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get environment variables
  const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Cloudinary credentials not configured in environment variables' 
      })
    };
  }

  try {
    const { file, title } = JSON.parse(event.body);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('public_id', title || `photo-${Date.now()}`);
    formData.append('tags', 'mobile-upload,netlify');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          url: data.secure_url,
          publicId: data.public_id,
          size: data.bytes
        })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.error })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};