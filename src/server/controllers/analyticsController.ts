import { Request, Response } from 'express';
import { AnalyticsService, AnalyticsFiltersSchema } from '../services/analyticsService.js';
import { z } from 'zod';

/**
 * Zod schema for query params (filters)
 */
const queryFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  brandId: z.string().optional(),
  articleId: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

/**
 * Controller for analytics endpoints.
 *
 * This controller:
 * - Validates query params with Zod
 * - Calls appropriate AnalyticsService methods
 * - Handles errors gracefully
 * - Requires authentication (enforced by middleware)
 */
export class AnalyticsController {
  /**
   * Get global analytics overview.
   *
   * Route: GET /api/analytics/overview
   * Access: Authenticated users
   *
   * @param req - Express request
   * @param res - Express response
   */
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        brandId: queryParams.brandId,
        articleId: queryParams.articleId,
      };

      // Get global stats
      const stats = await AnalyticsService.getGlobalStats(filters);

      res.json(stats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching analytics overview:', error);
      res.status(500).json({ error: 'Failed to fetch analytics overview' });
    }
  }

  /**
   * Get views over time analytics.
   *
   * Route: GET /api/analytics/views-over-time
   * Access: Authenticated users
   *
   * @param req - Express request
   * @param res - Express response
   */
  static async getViewsOverTime(req: Request, res: Response): Promise<void> {
    try {
      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        brandId: queryParams.brandId,
        articleId: queryParams.articleId,
      };

      const data = await AnalyticsService.getViewsOverTime(filters);
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching views over time:', error);
      res.status(500).json({ error: 'Failed to fetch views over time' });
    }
  }

  /**
   * Get device breakdown analytics.
   *
   * Route: GET /api/analytics/device-breakdown
   * Access: Authenticated users
   *
   * @param req - Express request
   * @param res - Express response
   */
  static async getDeviceBreakdown(req: Request, res: Response): Promise<void> {
    try {
      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        brandId: queryParams.brandId,
        articleId: queryParams.articleId,
      };

      const data = await AnalyticsService.getDeviceBreakdown(filters);
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching device breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch device breakdown' });
    }
  }

  /**
   * Get geographic distribution analytics.
   *
   * Route: GET /api/analytics/geographic
   * Access: Authenticated users
   *
   * @param req - Express request
   * @param res - Express response
   */
  static async getGeographicDistribution(req: Request, res: Response): Promise<void> {
    try {
      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        brandId: queryParams.brandId,
        articleId: queryParams.articleId,
      };

      const data = await AnalyticsService.getGeographicDistribution(filters);
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching geographic distribution:', error);
      res.status(500).json({ error: 'Failed to fetch geographic distribution' });
    }
  }

  /**
   * Get top articles analytics.
   *
   * Route: GET /api/analytics/top-articles
   * Access: Authenticated users
   *
   * @param req - Express request
   * @param res - Express response
   */
  static async getTopArticles(req: Request, res: Response): Promise<void> {
    try {
      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        brandId: queryParams.brandId,
        articleId: queryParams.articleId,
        limit: queryParams.limit || 10,
      };

      const data = await AnalyticsService.getTopArticles(filters);
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching top articles:', error);
      res.status(500).json({ error: 'Failed to fetch top articles' });
    }
  }

  /**
   * Get analytics for a specific brand.
   *
   * Route: GET /api/analytics/brand/:id
   * Access: Authenticated users
   *
   * @param req - Express request with brand ID param
   * @param res - Express response
   */
  static async getBrandAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const brandId = req.params.id;

      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        brandId,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      };

      // Get analytics data for the brand
      const viewsOverTime = await AnalyticsService.getViewsOverTime(filters);
      const deviceBreakdown = await AnalyticsService.getDeviceBreakdown(filters);
      const geographicDistribution = await AnalyticsService.getGeographicDistribution(filters);
      const topArticles = await AnalyticsService.getTopArticles({ ...filters, limit: 10 });

      res.json({
        brandId,
        viewsOverTime,
        deviceBreakdown,
        geographicDistribution,
        topArticles,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching brand analytics:', error);
      res.status(500).json({ error: 'Failed to fetch brand analytics' });
    }
  }

  /**
   * Get analytics for a specific article.
   *
   * Route: GET /api/analytics/article/:id
   * Access: Authenticated users
   *
   * @param req - Express request with article ID param
   * @param res - Express response
   */
  static async getArticleAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const articleId = req.params.id;

      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        articleId,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      };

      // Get analytics data for the article
      const viewsOverTime = await AnalyticsService.getViewsOverTime(filters);
      const deviceBreakdown = await AnalyticsService.getDeviceBreakdown(filters);
      const geographicDistribution = await AnalyticsService.getGeographicDistribution(filters);

      res.json({
        articleId,
        viewsOverTime,
        deviceBreakdown,
        geographicDistribution,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error fetching article analytics:', error);
      res.status(500).json({ error: 'Failed to fetch article analytics' });
    }
  }

  /**
   * Export analytics data as CSV.
   *
   * Route: GET /api/analytics/export
   * Access: Super admin only
   *
   * @param req - Express request with query params
   * @param res - Express response (CSV stream)
   */
  static async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // Validate query params
      const queryParams = queryFiltersSchema.parse(req.query);

      // Build filters
      const filters = {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        brandId: queryParams.brandId,
        articleId: queryParams.articleId,
      };

      // Stream CSV response
      await AnalyticsService.streamAnalyticsCSV(res, filters);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }

      console.error('Error exporting analytics:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to export analytics data' });
      }
    }
  }
}
