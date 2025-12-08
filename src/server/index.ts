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
import { errorHandler } from './middleware/errorHandler.js';
import { MigrationService } from './services/migrationService.js';

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
  console.log('🚀 Starting Fictional News Generator...');
  console.log(`📦 Version: ${APP_VERSION}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);

  // CRITICAL: Run migrations FIRST before setting up routes
  // For tests, we might want to skip this or use a different DB
  if (NODE_ENV !== 'test') {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/fictional_news.db';
    const migrationService = new MigrationService(dbPath, APP_VERSION);
    await migrationService.checkAndApplyMigrations();
    migrationService.close();
  }

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploads directory
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    });
  });

  // Version endpoint
  app.get('/api/version', (req: Request, res: Response) => {
    try {
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/fictional_news.db';
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

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/templates', templateRoutes);

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

    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 API docs available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Export app for testing
export { app };

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
