import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import articleRoutes from './routes/articles.js';
import brandRoutes from './routes/brands.js';
import templateRoutes from './routes/templates.js';
import publicRoutes from './routes/public.js';
import analyticsRoutes from './routes/analytics.js';
import configRoutes from './routes/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { MigrationService } from './services/migrationService.js';
import { aiGenerationRateLimiter } from './middleware/rateLimiter.js';
import { db } from './config/database.js';
import logger from './config/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
);
const APP_VERSION = packageJson.version;

/**
 * Setup the express application
 */
export async function setupServer() {
  logger.info('🚀 Starting Fictional News Generator...');
  logger.info(`📦 Version: ${APP_VERSION}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);

  // Ensure DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    logger.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  logger.info(`🗄️  Database URL: ${process.env.DATABASE_URL}`);

  // CRITICAL: Run migrations FIRST before setting up routes
  // For tests, we might want to skip this or use a different DB
  if (NODE_ENV !== 'test') {
    const dbPath = process.env.DATABASE_URL.replace('file:', '');
    const migrationService = new MigrationService(dbPath, APP_VERSION);
    await migrationService.checkAndApplyMigrations();
    migrationService.close();
  }

  // Security middleware with CSP and HSTS configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
      },
    })
  );
  app.use(cors());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploads directory
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint with database connection check
  app.get('/health', async (req: Request, res: Response) => {
    try {
      // Check database connection
      await db.$queryRaw`SELECT 1`;

      // Get database version
      let dbVersion = null;
      try {
        const versionResult = await db.appVersion.findFirst({
          orderBy: { appliedAt: 'desc' }
        });
        dbVersion = versionResult?.version || null;
      } catch (error) {
        // AppVersion table might not exist yet
      }

      res.status(200).json({
        status: 'healthy',
        version: APP_VERSION,
        dbVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Version endpoint
  app.get('/api/version', (req: Request, res: Response) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not configured' });
      }
      const dbPath = process.env.DATABASE_URL.replace('file:', '');
      const Database = require('better-sqlite3');
      const db = new Database(dbPath);

      // Get database version and migrations
      let databaseVersion = null;
      let appliedMigrations: string[] = [];

      try {
        const versionResult = db
          .prepare('SELECT version, migrations FROM AppVersion ORDER BY appliedAt DESC LIMIT 1')
          .get();

        if (versionResult) {
          databaseVersion = versionResult.version;
          try {
            appliedMigrations = JSON.parse(versionResult.migrations);
          } catch (e) {
            appliedMigrations = [];
          }
        }
      } catch (error) {
        // AppVersion table doesn't exist yet
      }

      db.close();

      res.status(200).json({
        version: APP_VERSION,
        environment: NODE_ENV,
        databaseVersion,
        appliedMigrations,
      });
    } catch (error) {
      res.status(200).json({
        version: APP_VERSION,
        environment: NODE_ENV,
        databaseVersion: null,
        appliedMigrations: [],
      });
    }
  });

  // Public Routes (must be mounted before API routes to handle /:brandSlug pattern)
  app.use('/', publicRoutes);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/config', configRoutes);

  // Serve static files in production
  if (NODE_ENV === 'production') {
    app.use(express.static(join(process.cwd(), 'dist/client')));

    app.get('*', (req: Request, res: Response) => {
      res.sendFile(join(process.cwd(), 'dist/client/index.html'));
    });
  }

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
async function startServer() {
  try {
    await setupServer();

    // Start listening and keep reference to server instance
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on http://localhost:${PORT}`);
      logger.info(`📖 API docs available at http://localhost:${PORT}/api`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      // Set timeout to force exit if shutdown takes too long
      const shutdownTimeout = setTimeout(() => {
        logger.error('Shutdown timeout, forcing exit');
        process.exit(1);
      }, 10000); // 10 seconds timeout

      try {
        // Close server (stop accepting new connections)
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) {
              logger.error('Error closing server:', err);
              reject(err);
            } else {
              logger.info('Server closed successfully');
              resolve();
            }
          });
        });

        // Disconnect database
        await db.$disconnect();
        logger.info('Database disconnected successfully');

        clearTimeout(shutdownTimeout);
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        clearTimeout(shutdownTimeout);
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Export app for testing
export { app };

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
