// main.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { urlRouter, errorHandler } from './utils.js';
import { initialize } from './database.js';

const app = express();

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data
app.use(express.json()); // Body parser for JSON data
app.use(errorHandler); // Error handling
app.use('/public', express.static(join(process.cwd(), 'public'))); // Static files
app.use('/api', urlRouter);// Routes

// Initialize database
initialize().catch((error) => {
  console.error('Failed to initialize the database. Exiting...');
  process.exit(1); // Exit the application on initialization failure
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
