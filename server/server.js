import { app } from "./app.js";
import { config } from "dotenv";

// Load environment variables
config({ path: "./config.env" });

// Port configuration - Render provides PORT in environment
const PORT = process.env.PORT || 4000;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 E Smart Wallet API running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});