// Import the app
const app = require("./app");

// Use port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
