import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/chatbot";
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define basic route (health check)
app.get("/", (req, res) => {
  res.send("Chatbot API is up and running");
});

// Import and use routes
import sessionRoutes from "./routes/session";
app.use("/session", sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
