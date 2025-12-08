import { Router } from 'express';
import { ArticleController } from '../controllers/articleController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/generate', authMiddleware, ArticleController.generateArticle);
router.post('/', authMiddleware, ArticleController.createArticle);
router.get('/', authMiddleware, ArticleController.listArticles);
router.get('/:id', authMiddleware, ArticleController.getArticle);
router.put('/:id', authMiddleware, ArticleController.updateArticle);
router.delete('/:id', authMiddleware, ArticleController.deleteArticle);
router.put('/:id/publish', authMiddleware, ArticleController.publishArticle);

export default router;
