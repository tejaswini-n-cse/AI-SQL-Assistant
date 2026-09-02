import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { geminiRouter } from './routes/gemini.ts';
import { sqlRouter } from './routes/sqlRouter.ts';

export function createExpressApp(): Express {
  const app = express();

  // Configure CORS safely
  const isProduction = process.env.NODE_ENV === 'production';

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.APP_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!isProduction) return callback(null, true);
        const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));
        if (isAllowed || origin.includes('.run.app') || origin.includes('localhost')) {
          return callback(null, true);
        }
        return callback(new Error('CORS policy: Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    })
  );

  // Parse JSON payloads with size safety limit
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Mount SQL and Gemini API endpoints
  app.use('/api/sql', sqlRouter);
  app.use('/api/gemini', geminiRouter);

  // Generic Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'ai-sql-assistant-gateway',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  // Safe global error handler
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error('[Unhandled Server Error]:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again.',
    });
  });

  return app;
}
