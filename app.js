const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const initAdmin = require("./config/initAdmin");

// Connect to MongoDB Atlas using connection string from .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("✅ Connected to MongoDB Atlas");
   // Call admin init logic
  await initAdmin();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Use JSON parser middleware
app.use(express.json());

// Use /api/auth for all auth-related routes
const userRoutes = require("./routes/userRoutes"); // <- you'll create this soon
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/PrescriptionRoutes');
const reportRoutes = require('./routes/LabreportsRoutes');

// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // protected routes
app.use("/api/admin", adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/tmp", express.static("/tmp"));
// Export app for use in server.js
module.exports = app;
