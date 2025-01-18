import mongoose from 'mongoose';

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

// Async function to initialize database connection
const initialize = async () => {
  try {
    console.log('Establishing connection with MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connection established.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Re-throw to handle it in the main application
  }
};

// Define schema and model
const urlSchema = new mongoose.Schema({
  url: { type: String, unique: true }, // Enforce unique URLs
  shortUrl: { type: Number, unique: true },
});

// Build model
const Url = mongoose.model('Url', urlSchema);

// Helper function to generate a unique short URL
const generateUniqueShortUrl = async () => {
  let shortUrl;
  let exists = true;

  do {
    // Generate a random 5-digit number for short URL
    shortUrl = Math.floor(10000 + Math.random() * 90000);

    // Check if it already exists in the database
    exists = await Url.exists({ shortUrl });
  } while (exists);

  return shortUrl;
};

// Create and save a new URL
const createAndSaveUrl = async (inputUrl) => {
  try {
    const shortUrl = await generateUniqueShortUrl();
    const newUrl = new Url({ url: inputUrl, shortUrl });
    return await newUrl.save();
  } catch (error) {
    console.error('Error saving URL:', error);
    throw error;
  }
};

// Generic finder function
const findUrlByParameter = async (parameter, value) => {
  try {
    const query = {};
    query[parameter] = value; // Dynamically set the field
    return await Url.findOne(query);
  } catch (error) {
    console.error('Error finding URL:', error);
    throw error;
  }
};

// Find or create a URL (DRY approach)
const findOrCreateUrl = async (inputUrl) => {
  try {
    // Check if the URL already exists
    const existingUrl = await findUrlByParameter('url', inputUrl);
    if (existingUrl) {
      return existingUrl; // Return existing document
    }

    // If not found, create and return a new URL
    return await createAndSaveUrl(inputUrl);
  } catch (error) {
    console.error('Error in findOrCreateUrl:', error);
    throw error;
  }
};

// Export initialization and utility functions
export {
  initialize,
  createAndSaveUrl,
  findUrlByParameter,
  findOrCreateUrl,
};
