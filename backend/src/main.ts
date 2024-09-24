import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sessionRoutes from './services/session';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatbotDB';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use session routes
app.use('/session', sessionRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Chatbot API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
