import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';

export const app = express();

// Enable CORS for frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, Vite dev server, and tools
      callback(null, true);
    },
    credentials: true,
  })
);

// Body parser with rawBody capture for Razorpay webhook signature verification
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use(errorHandler);
