// utils.js
import { Router } from 'express';
import { findOrCreateUrl, findUrlByParameter } from './database.js';

const urlRouter = Router();

// POST: Create and save or return existing short URL
urlRouter.post('/shorturl', async (req, res) => {
  // Accept URL from either body or urlencoded form data
  const url = req.body.url;
  
  if (!url) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL format: http(s)://www.example.com
  const urlRegex = /^https?:\/\/(www\.)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i;
  
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Proceed to find or create the URL
    const savedUrl = await findOrCreateUrl(url);

    // Return in the exact format specified by the test
    return res.json({
      original_url: savedUrl.url,
      short_url: savedUrl.shortUrl
    });

  } catch (err) {
    console.error('Error in POST /shorturl:', err);
    return res.json({ error: 'invalid url' });
  }
});

// GET: Redirect to the original URL
urlRouter.get('/shorturl/:short_url', async (req, res) => {
  const short_url = Number(req.params.short_url);
  
  if (isNaN(short_url)) {
    return res.status(400).json({ error: 'invalid url' });
  }
  
  try {
    const urlDocument = await findUrlByParameter('shortUrl', short_url);
    if (!urlDocument) {
      return res.status(404).json({ error: 'No short URL found' });
    }

    return res.redirect(urlDocument.url);
  } catch (error) {
    console.error('Error in GET /shorturl/:short_url:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Server error' });
};

export { urlRouter, errorHandler };