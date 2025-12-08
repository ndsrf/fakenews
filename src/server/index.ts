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
 * Start the server
 */
async function startServer() {
  try {
    console.log('🚀 Starting Fictional News Generator...');
    console.log(`📦 Version: ${APP_VERSION}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);

    // CRITICAL: Run migrations FIRST before setting up routes
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/fictional_news.db';
    const migrationService = new MigrationService(dbPath, APP_VERSION);
    await migrationService.checkAndApplyMigrations();
    migrationService.close();

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
        status: 'healthy',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
      });
    });

    // Version endpoint
    app.get('/api/version', (req: Request, res: Response) => {
      res.status(200).json({
        version: APP_VERSION,
        environment: NODE_ENV,
      });
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

// Start the server
startServer();
