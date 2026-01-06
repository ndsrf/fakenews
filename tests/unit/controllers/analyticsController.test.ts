import { Request, Response } from 'express';
import { AnalyticsController } from '../../../src/server/controllers/analyticsController';
import { AnalyticsService } from '../../../src/server/services/analyticsService';
import { z } from 'zod';

jest.mock('../../../src/server/services/analyticsService');

describe('AnalyticsController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { json, status };
    req = {
      query: {},
      params: {},
    } as any;

    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return analytics overview with all data', async () => {
      const mockStats = { totalViews: 100, uniqueVisitors: 50 };
      const mockViewsOverTime = [{ date: '2024-01-01', views: 10 }];
      const mockDeviceBreakdown = [{ device: 'desktop', count: 50 }];
      const mockGeoDistribution = [{ country: 'US', count: 30 }];
      const mockTopArticles = [{ id: '1', title: 'Article', views: 20 }];

      (AnalyticsService.getGlobalStats as jest.Mock).mockResolvedValue(mockStats);
      (AnalyticsService.getViewsOverTime as jest.Mock).mockResolvedValue(mockViewsOverTime);
      (AnalyticsService.getDeviceBreakdown as jest.Mock).mockResolvedValue(mockDeviceBreakdown);
      (AnalyticsService.getGeographicDistribution as jest.Mock).mockResolvedValue(mockGeoDistribution);
      (AnalyticsService.getTopArticles as jest.Mock).mockResolvedValue(mockTopArticles);

      await AnalyticsController.getOverview(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        stats: mockStats,
        viewsOverTime: mockViewsOverTime,
        deviceBreakdown: mockDeviceBreakdown,
        geographicDistribution: mockGeoDistribution,
        topArticles: mockTopArticles,
      });
    });

    it('should handle query params correctly', async () => {
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        brandId: 'brand-1',
        articleId: 'article-1',
      };

      (AnalyticsService.getGlobalStats as jest.Mock).mockResolvedValue({});
      (AnalyticsService.getViewsOverTime as jest.Mock).mockResolvedValue([]);
      (AnalyticsService.getDeviceBreakdown as jest.Mock).mockResolvedValue([]);
      (AnalyticsService.getGeographicDistribution as jest.Mock).mockResolvedValue([]);
      (AnalyticsService.getTopArticles as jest.Mock).mockResolvedValue([]);

      await AnalyticsController.getOverview(req as Request, res as Response);

      expect(AnalyticsService.getGlobalStats).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          brandId: 'brand-1',
          articleId: 'article-1',
        })
      );
    });

    it('should return 400 for invalid query params', async () => {
      // Using an object instead of a string will cause zod validation to fail
      req.query = { limit: { invalid: 'object' } } as any;

      await AnalyticsController.getOverview(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid query parameters',
        })
      );
    });

    it('should handle service errors', async () => {
      (AnalyticsService.getGlobalStats as jest.Mock).mockRejectedValue(new Error('Service error'));

      await AnalyticsController.getOverview(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch analytics overview' });
    });
  });

  describe('getViewsOverTime', () => {
    it('should return views over time data', async () => {
      const mockData = [{ date: '2024-01-01', views: 10 }];
      (AnalyticsService.getViewsOverTime as jest.Mock).mockResolvedValue(mockData);

      await AnalyticsController.getViewsOverTime(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      (AnalyticsService.getViewsOverTime as jest.Mock).mockRejectedValue(new Error('Error'));

      await AnalyticsController.getViewsOverTime(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch views over time' });
    });
  });

  describe('getDeviceBreakdown', () => {
    it('should return device breakdown data', async () => {
      const mockData = [{ device: 'desktop', count: 50 }];
      (AnalyticsService.getDeviceBreakdown as jest.Mock).mockResolvedValue(mockData);

      await AnalyticsController.getDeviceBreakdown(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      (AnalyticsService.getDeviceBreakdown as jest.Mock).mockRejectedValue(new Error('Error'));

      await AnalyticsController.getDeviceBreakdown(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch device breakdown' });
    });
  });

  describe('getGeographicDistribution', () => {
    it('should return geographic distribution data', async () => {
      const mockData = [{ country: 'US', count: 30 }];
      (AnalyticsService.getGeographicDistribution as jest.Mock).mockResolvedValue(mockData);

      await AnalyticsController.getGeographicDistribution(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      (AnalyticsService.getGeographicDistribution as jest.Mock).mockRejectedValue(new Error('Error'));

      await AnalyticsController.getGeographicDistribution(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch geographic distribution' });
    });
  });

  describe('getTopArticles', () => {
    it('should return top articles data', async () => {
      const mockData = [{ id: '1', title: 'Article', views: 20 }];
      (AnalyticsService.getTopArticles as jest.Mock).mockResolvedValue(mockData);

      await AnalyticsController.getTopArticles(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should use default limit of 10', async () => {
      (AnalyticsService.getTopArticles as jest.Mock).mockResolvedValue([]);

      await AnalyticsController.getTopArticles(req as Request, res as Response);

      expect(AnalyticsService.getTopArticles).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });

    it('should respect custom limit', async () => {
      req.query = { limit: '20' };
      (AnalyticsService.getTopArticles as jest.Mock).mockResolvedValue([]);

      await AnalyticsController.getTopArticles(req as Request, res as Response);

      expect(AnalyticsService.getTopArticles).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 })
      );
    });

    it('should handle errors', async () => {
      (AnalyticsService.getTopArticles as jest.Mock).mockRejectedValue(new Error('Error'));

      await AnalyticsController.getTopArticles(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch top articles' });
    });
  });

  describe('getBrandAnalytics', () => {
    it('should return brand analytics', async () => {
      req.params = { id: 'brand-1' };

      const mockViewsOverTime = [{ date: '2024-01-01', views: 10 }];
      const mockDeviceBreakdown = [{ device: 'desktop', count: 50 }];
      const mockGeoDistribution = [{ country: 'US', count: 30 }];
      const mockTopArticles = [{ id: '1', title: 'Article', views: 20 }];

      (AnalyticsService.getViewsOverTime as jest.Mock).mockResolvedValue(mockViewsOverTime);
      (AnalyticsService.getDeviceBreakdown as jest.Mock).mockResolvedValue(mockDeviceBreakdown);
      (AnalyticsService.getGeographicDistribution as jest.Mock).mockResolvedValue(mockGeoDistribution);
      (AnalyticsService.getTopArticles as jest.Mock).mockResolvedValue(mockTopArticles);

      await AnalyticsController.getBrandAnalytics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        brandId: 'brand-1',
        viewsOverTime: mockViewsOverTime,
        deviceBreakdown: mockDeviceBreakdown,
        geographicDistribution: mockGeoDistribution,
        topArticles: mockTopArticles,
      });
    });

    it('should handle errors', async () => {
      req.params = { id: 'brand-1' };
      (AnalyticsService.getViewsOverTime as jest.Mock).mockRejectedValue(new Error('Error'));

      await AnalyticsController.getBrandAnalytics(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch brand analytics' });
    });
  });

  describe('getArticleAnalytics', () => {
    it('should return article analytics', async () => {
      req.params = { id: 'article-1' };

      const mockViewsOverTime = [{ date: '2024-01-01', views: 10 }];
      const mockDeviceBreakdown = [{ device: 'desktop', count: 50 }];
      const mockGeoDistribution = [{ country: 'US', count: 30 }];

      (AnalyticsService.getViewsOverTime as jest.Mock).mockResolvedValue(mockViewsOverTime);
      (AnalyticsService.getDeviceBreakdown as jest.Mock).mockResolvedValue(mockDeviceBreakdown);
      (AnalyticsService.getGeographicDistribution as jest.Mock).mockResolvedValue(mockGeoDistribution);

      await AnalyticsController.getArticleAnalytics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        articleId: 'article-1',
        viewsOverTime: mockViewsOverTime,
        deviceBreakdown: mockDeviceBreakdown,
        geographicDistribution: mockGeoDistribution,
      });
    });

    it('should handle errors', async () => {
      req.params = { id: 'article-1' };
      (AnalyticsService.getViewsOverTime as jest.Mock).mockRejectedValue(new Error('Error'));

      await AnalyticsController.getArticleAnalytics(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch article analytics' });
    });
  });

  describe('exportAnalytics', () => {
    it('should export analytics as CSV', async () => {
      (AnalyticsService.streamAnalyticsCSV as jest.Mock).mockResolvedValue(undefined);

      await AnalyticsController.exportAnalytics(req as Request, res as Response);

      expect(AnalyticsService.streamAnalyticsCSV).toHaveBeenCalledWith(res, expect.any(Object));
    });

    it('should handle errors when headers not sent', async () => {
      (AnalyticsService.streamAnalyticsCSV as jest.Mock).mockRejectedValue(new Error('Error'));
      (res as any).headersSent = false;

      await AnalyticsController.exportAnalytics(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to export analytics data' });
    });

    it('should not send error response if headers already sent', async () => {
      (AnalyticsService.streamAnalyticsCSV as jest.Mock).mockRejectedValue(new Error('Error'));
      (res as any).headersSent = true;

      await AnalyticsController.exportAnalytics(req as Request, res as Response);

      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
