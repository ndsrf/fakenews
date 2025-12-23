import { AnalyticsService } from '../../../src/server/services/analyticsService';
import { db } from '../../../src/server/config/database';

// Mock the database module
jest.mock('../../../src/server/config/database', () => ({
  db: {
    pageView: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    article: {
      count: jest.fn(),
    },
    newsBrand: {
      count: jest.fn(),
    },
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    // Silence console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getGlobalStats', () => {
    it('should return global statistics', async () => {
      // Mock the database calls
      (db.pageView.count as jest.Mock).mockResolvedValue(1000);
      (db.article.count as jest.Mock).mockResolvedValue(50);
      (db.newsBrand.count as jest.Mock).mockResolvedValue(5);

      const result = await AnalyticsService.getGlobalStats();

      expect(result).toEqual({
        totalViews: 1000,
        totalArticles: 50,
        totalBrands: 5,
      });

      expect(db.pageView.count).toHaveBeenCalledTimes(1);
      expect(db.article.count).toHaveBeenCalledWith({ where: { status: 'published' } });
      expect(db.newsBrand.count).toHaveBeenCalledWith({ where: { isActive: true } });
    });

    it('should return zeros when database calls fail', async () => {
      // Mock database to throw errors
      (db.pageView.count as jest.Mock).mockRejectedValue(new Error('Database error'));
      (db.article.count as jest.Mock).mockRejectedValue(new Error('Database error'));
      (db.newsBrand.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await AnalyticsService.getGlobalStats();

      expect(result).toEqual({
        totalViews: 0,
        totalArticles: 0,
        totalBrands: 0,
      });
    });

    it('should return zeros when no data exists', async () => {
      (db.pageView.count as jest.Mock).mockResolvedValue(0);
      (db.article.count as jest.Mock).mockResolvedValue(0);
      (db.newsBrand.count as jest.Mock).mockResolvedValue(0);

      const result = await AnalyticsService.getGlobalStats();

      expect(result).toEqual({
        totalViews: 0,
        totalArticles: 0,
        totalBrands: 0,
      });
    });
  });

  describe('getViewsOverTime', () => {
    it('should return views grouped by date', async () => {
      const mockPageViews = [
        { timestamp: new Date('2024-01-01T10:00:00Z') },
        { timestamp: new Date('2024-01-01T15:00:00Z') },
        { timestamp: new Date('2024-01-02T10:00:00Z') },
        { timestamp: new Date('2024-01-02T12:00:00Z') },
        { timestamp: new Date('2024-01-03T10:00:00Z') },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getViewsOverTime();

      expect(result).toEqual([
        { date: '2024-01-01', views: 2 },
        { date: '2024-01-02', views: 2 },
        { date: '2024-01-03', views: 1 },
      ]);
    });

    it('should filter by startDate and endDate', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.getViewsOverTime({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-01-31T23:59:59Z'),
          },
        },
        select: {
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
    });

    it('should filter by articleId', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.getViewsOverTime({
        articleId: 'article-123',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith({
        where: {
          articleId: 'article-123',
        },
        select: {
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
    });

    it('should filter by brandId through article join', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.getViewsOverTime({
        brandId: 'brand-123',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith({
        where: {
          article: {
            brandId: 'brand-123',
          },
        },
        select: {
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
    });

    it('should return empty array when no data exists', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsService.getViewsOverTime();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (db.pageView.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await AnalyticsService.getViewsOverTime();

      expect(result).toEqual([]);
    });
  });

  describe('getDeviceBreakdown', () => {
    it('should return device breakdown with percentages', async () => {
      const mockPageViews = [
        { device: 'desktop' },
        { device: 'desktop' },
        { device: 'desktop' },
        { device: 'mobile' },
        { device: 'mobile' },
        { device: 'tablet' },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getDeviceBreakdown();

      expect(result).toEqual([
        { device: 'desktop', count: 3, percentage: 50 },
        { device: 'mobile', count: 2, percentage: 33.33333333333333 },
        { device: 'tablet', count: 1, percentage: 16.666666666666664 },
      ]);
    });

    it('should handle null device values', async () => {
      const mockPageViews = [
        { device: 'desktop' },
        { device: null },
        { device: null },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getDeviceBreakdown();

      expect(result).toEqual([
        { device: 'unknown', count: 2, percentage: 66.66666666666666 },
        { device: 'desktop', count: 1, percentage: 33.33333333333333 },
      ]);
    });

    it('should apply filters correctly', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.getDeviceBreakdown({
        startDate: '2024-01-01T00:00:00Z',
        articleId: 'article-123',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: new Date('2024-01-01T00:00:00Z'),
          },
          articleId: 'article-123',
        },
        select: {
          device: true,
        },
      });
    });

    it('should return empty array when no data exists', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsService.getDeviceBreakdown();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (db.pageView.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await AnalyticsService.getDeviceBreakdown();

      expect(result).toEqual([]);
    });

    it('should handle zero percentage when no views', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsService.getDeviceBreakdown();

      expect(result).toEqual([]);
    });
  });

  describe('getGeographicDistribution', () => {
    it('should return country distribution sorted by count', async () => {
      const mockPageViews = [
        { country: 'US' },
        { country: 'US' },
        { country: 'US' },
        { country: 'GB' },
        { country: 'GB' },
        { country: 'FR' },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getGeographicDistribution();

      expect(result).toEqual([
        { country: 'US', count: 3 },
        { country: 'GB', count: 2 },
        { country: 'FR', count: 1 },
      ]);
    });

    it('should handle null country values', async () => {
      const mockPageViews = [
        { country: 'US' },
        { country: null },
        { country: null },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getGeographicDistribution();

      expect(result).toEqual([
        { country: 'unknown', count: 2 },
        { country: 'US', count: 1 },
      ]);
    });

    it('should apply filters correctly', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.getGeographicDistribution({
        brandId: 'brand-123',
        endDate: '2024-12-31T23:59:59Z',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            lte: new Date('2024-12-31T23:59:59Z'),
          },
          article: {
            brandId: 'brand-123',
          },
        },
        select: {
          country: true,
        },
      });
    });

    it('should return empty array when no data exists', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsService.getGeographicDistribution();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (db.pageView.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await AnalyticsService.getGeographicDistribution();

      expect(result).toEqual([]);
    });
  });

  describe('getTopArticles', () => {
    it('should return top articles sorted by view count', async () => {
      const mockPageViews = [
        {
          articleId: 'article-1',
          timestamp: new Date('2024-01-03T10:00:00Z'),
          article: {
            title: 'Article 1',
            brand: { name: 'Brand A' },
          },
        },
        {
          articleId: 'article-1',
          timestamp: new Date('2024-01-02T10:00:00Z'),
          article: {
            title: 'Article 1',
            brand: { name: 'Brand A' },
          },
        },
        {
          articleId: 'article-1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: {
            title: 'Article 1',
            brand: { name: 'Brand A' },
          },
        },
        {
          articleId: 'article-2',
          timestamp: new Date('2024-01-02T10:00:00Z'),
          article: {
            title: 'Article 2',
            brand: { name: 'Brand B' },
          },
        },
        {
          articleId: 'article-2',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: {
            title: 'Article 2',
            brand: { name: 'Brand B' },
          },
        },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getTopArticles();

      expect(result).toEqual([
        {
          id: 'article-1',
          title: 'Article 1',
          brand: 'Brand A',
          views: 3,
          lastViewed: new Date('2024-01-03T10:00:00Z'),
        },
        {
          id: 'article-2',
          title: 'Article 2',
          brand: 'Brand B',
          views: 2,
          lastViewed: new Date('2024-01-02T10:00:00Z'),
        },
      ]);
    });

    it('should respect limit parameter', async () => {
      const mockPageViews = [
        {
          articleId: 'article-1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: { title: 'Article 1', brand: { name: 'Brand A' } },
        },
        {
          articleId: 'article-2',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: { title: 'Article 2', brand: { name: 'Brand B' } },
        },
        {
          articleId: 'article-3',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: { title: 'Article 3', brand: { name: 'Brand C' } },
        },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getTopArticles({ limit: 2 });

      expect(result).toHaveLength(2);
    });

    it('should use default limit of 10', async () => {
      const mockPageViews = Array.from({ length: 15 }, (_, i) => ({
        articleId: `article-${i}`,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        article: { title: `Article ${i}`, brand: { name: 'Brand' } },
      }));

      (db.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const result = await AnalyticsService.getTopArticles();

      expect(result).toHaveLength(10);
    });

    it('should apply filters correctly', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.getTopArticles({
        startDate: '2024-01-01T00:00:00Z',
        brandId: 'brand-123',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: new Date('2024-01-01T00:00:00Z'),
          },
          article: {
            brandId: 'brand-123',
          },
        },
        include: {
          article: {
            include: {
              brand: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('should return empty array when no data exists', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AnalyticsService.getTopArticles();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (db.pageView.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await AnalyticsService.getTopArticles();

      expect(result).toEqual([]);
    });
  });

  describe('streamAnalyticsCSV', () => {
    let mockRes: any;

    beforeEach(() => {
      mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false,
      };
    });

    it('should stream CSV data with proper headers', async () => {
      const mockBatch = [
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: {
            title: 'Test Article',
            brand: { name: 'Test Brand' },
          },
          country: 'US',
          city: 'New York',
          browser: 'Chrome',
          os: 'Windows',
          device: 'desktop',
          referrer: 'https://google.com',
        },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValueOnce(mockBatch).mockResolvedValueOnce([]);

      await AnalyticsService.streamAnalyticsCSV(mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=analytics.csv'
      );
      expect(mockRes.write).toHaveBeenCalledWith(
        'Timestamp,Article,Brand,Country,City,Browser,OS,Device,Referrer\n'
      );
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should stream data in batches of 1000', async () => {
      const batchRow = {
        timestamp: new Date('2024-01-01T10:00:00Z'),
        article: { title: 'Article', brand: { name: 'Brand' } },
        country: 'US',
        city: null,
        browser: 'Chrome',
        os: 'Windows',
        device: 'desktop',
        referrer: null,
      };

      const batch1 = Array(1000).fill(batchRow);
      const batch2 = Array(500).fill(batchRow);

      (db.pageView.findMany as jest.Mock)
        .mockResolvedValueOnce(batch1)
        .mockResolvedValueOnce(batch2);

      await AnalyticsService.streamAnalyticsCSV(mockRes);

      // Should make 2 database calls (1000 items triggers next batch, 500 items ends loop)
      expect(db.pageView.findMany).toHaveBeenCalledTimes(2);
      // 1 header + 1000 rows + 500 rows = 1501 writes
      expect(mockRes.write).toHaveBeenCalled();
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should escape CSV values with commas and quotes', async () => {
      const mockBatch = [
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: {
            title: 'Article with, comma',
            brand: { name: 'Brand with "quotes"' },
          },
          country: 'US',
          city: 'New\nYork',
          browser: 'Chrome',
          os: 'Windows',
          device: 'desktop',
          referrer: '',
        },
      ];

      (db.pageView.findMany as jest.Mock).mockResolvedValueOnce(mockBatch);

      await AnalyticsService.streamAnalyticsCSV(mockRes);

      // Get all the write calls to find the data row
      const writeCalls = (mockRes.write as jest.Mock).mock.calls;
      const dataRow = writeCalls.find((call) => call[0].includes('Article with'));

      expect(dataRow).toBeDefined();
      expect(dataRow[0]).toContain('"Article with, comma"');
      expect(dataRow[0]).toContain('"Brand with ""quotes"""');
      expect(dataRow[0]).toContain('"New\nYork"');
    });

    it('should handle database errors gracefully', async () => {
      // Mock to throw error on first call
      (db.pageView.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await AnalyticsService.streamAnalyticsCSV(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to export analytics data' });
    });

    it('should not send error response if headers already sent', async () => {
      mockRes.headersSent = true;
      (db.pageView.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await AnalyticsService.streamAnalyticsCSV(mockRes);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should apply filters to CSV export', async () => {
      (db.pageView.findMany as jest.Mock).mockResolvedValue([]);

      await AnalyticsService.streamAnalyticsCSV(mockRes, {
        startDate: '2024-01-01T00:00:00Z',
        articleId: 'article-123',
      });

      expect(db.pageView.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            timestamp: {
              gte: new Date('2024-01-01T00:00:00Z'),
            },
            articleId: 'article-123',
          },
        })
      );
    });
  });
});
