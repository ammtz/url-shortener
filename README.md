# Short URL API

A Node.js and Express-based API to shorten URLs.

## Features
- POST a URL to `/api/shorturl` to receive a shortened URL.
- Redirect to the original URL via `/api/shorturl/:short_url`.

## Internal functionality
- Connects with a MongoDB database
- Validates and normalizes input URLs


## Commands
- `npm start`: Run the server.
