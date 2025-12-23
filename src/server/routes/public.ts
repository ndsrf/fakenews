import { Router } from 'express';
import { PublicController } from '../controllers/publicController.js';
import { trackPageView } from '../middleware/analytics.js';

const router = Router();

/**
 * Public article viewing route
 * Pattern: /:brandSlug/article/:year/:month/:slug
 *
 * This route:
 * - Does not require authentication
 * - Applies analytics tracking middleware
 * - Returns published articles only (404 for drafts)
 */
router.get('/:brandSlug/article/:year/:month/:slug', trackPageView, PublicController.viewArticle);

export default router;
