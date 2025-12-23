import { Router } from 'express';
import { ArticleController } from '../controllers/articleController.js';
import { authMiddleware } from '../middleware/auth.js';
import { aiGenerationRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes (no auth required)
router.get('/slug/:slug', ArticleController.getArticleBySlug);

// Protected routes
router.post('/generate', authMiddleware, aiGenerationRateLimiter, ArticleController.generateArticle);
router.post('/', authMiddleware, ArticleController.createArticle);
router.get('/', authMiddleware, ArticleController.listArticles);
router.get('/:id', authMiddleware, ArticleController.getArticle);
router.put('/:id', authMiddleware, ArticleController.updateArticle);
router.delete('/:id', authMiddleware, ArticleController.deleteArticle);
router.put('/:id/publish', authMiddleware, ArticleController.publishArticle);

export default router;
