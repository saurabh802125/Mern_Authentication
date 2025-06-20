import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import entryRouter from "./routes/entryRouter.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";

export const app = express();
config({ path: "./config.env" });

// Fixed port configuration for deployment
const PORT = process.env.PORT || 4000;

// Updated CORS configuration for deployment
// Updated CORS configuration for deployment
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://e-smart-wallet.vercel.app', // Add your Vercel frontend URL here
  /^https:\/\/.*\.vercel\.app$/,      // Allow all Vercel domains
  /^https:\/\/.*\.onrender\.com$/,    // Allow all Render domains
  /^https:\/\/.*\.netlify\.app$/      // Allow all Netlify domains (bonus)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        return allowedOrigin.test(origin);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'Cookie'
    ]
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (important for deployment services)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E Smart Wallet API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/entries", entryRouter);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start automation and database connection
removeUnverifiedAccounts();
connection();

// Error middleware (must be last)
app.use(errorMiddleware);

// Remove the app.listen from here - it should only be in server.js
export default app;