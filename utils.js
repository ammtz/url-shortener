import { Router } from 'express';
import { promises as dns } from 'dns';
import { URL } from 'url';
import { findOrCreateUrl, findUrlByParameter } from './database.js';

const urlRouter = Router();

// Utility function to validate and resolve URLs
const validateUrl = async (url) => {
  // Add a default protocol if none is provided
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    // Parse the URL
    const parsedUrl = new URL(url);

    // Normalize by removing "www." if present
    const hostname = parsedUrl.hostname.startsWith('www.')
      ? parsedUrl.hostname.slice(4) // Remove "www."
      : parsedUrl.hostname;

    // DNS validation
    await dns.lookup(hostname);

    // Rebuild the normalized URL
    const normalizedUrl = `${parsedUrl.protocol}//${hostname}${parsedUrl.pathname}`;

    return normalizedUrl; // Return the normalized URL
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      throw new Error('invalid url');
    }
    throw err;
  }
};


// POST: Create and save or return existing short URL
urlRouter.post('/shorturl', async (req, res) => {
  let { url } = req.body;

  try {
    const validatedUrl = await validateUrl(url);
    const savedUrl = await findOrCreateUrl(validatedUrl);

    res.json({
      original_url: savedUrl.url,
      short_url: savedUrl.shortUrl,
    });
  } catch (err) {
    if (err.message === 'invalid url') {
      return res.json({ error: 'invalid url' });
    }
    console.error('Error in POST /shorturl:', err);
    res.status(500).json({ error: 'Failed to process the URL' });
  }
});

// GET: Redirect to the original URL
urlRouter.get('/shorturl/:short_url', async (req, res) => {
  const short_url = Number(req.params.short_url);
  // Validate if `short_url` is a valid number
  if (isNaN(short_url)) {
    return res.status(400).json({ error: 'Invalid short URL' });
  }
  
  try {
    const urlDocument = await findUrlByParameter('shortUrl', short_url);
    if (!urlDocument) {
      return res.status(404).json({ error: 'No short URL found for the given input' });
    }

    res.redirect(urlDocument.url);
  } catch (error) {
    console.error('Error in GET /shorturl/:short_url:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

export { urlRouter, errorHandler };
