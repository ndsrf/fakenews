import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Analytics routes
 *
 * All routes require authentication and apply rate limiting.
 * Overview and export routes require super admin access.
 */

// Global analytics overview (super admin only)
router.get('/overview', authMiddleware, requireSuperAdmin, apiRateLimiter, AnalyticsController.getOverview);

// Individual analytics endpoints (authenticated users)
router.get('/views-over-time', authMiddleware, apiRateLimiter, AnalyticsController.getViewsOverTime);
router.get('/device-breakdown', authMiddleware, apiRateLimiter, AnalyticsController.getDeviceBreakdown);
router.get('/geographic', authMiddleware, apiRateLimiter, AnalyticsController.getGeographicDistribution);
router.get('/top-articles', authMiddleware, apiRateLimiter, AnalyticsController.getTopArticles);

// Brand analytics (authenticated users)
router.get('/brand/:id', authMiddleware, apiRateLimiter, AnalyticsController.getBrandAnalytics);

// Article analytics (authenticated users)
router.get('/article/:id', authMiddleware, apiRateLimiter, AnalyticsController.getArticleAnalytics);

// Export analytics as CSV (super admin only)
router.get('/export', authMiddleware, requireSuperAdmin, apiRateLimiter, AnalyticsController.exportAnalytics);

export default router;
