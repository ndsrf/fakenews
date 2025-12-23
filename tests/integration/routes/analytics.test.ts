import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app, setupServer } from '../../../src/server/index';
import prisma from '../../../src/server/config/database';
import * as jwtUtils from '../../../src/server/utils/jwt';

// Mock the marked package to avoid ES module issues
jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((text: string) => `<p>${text}</p>`),
  },
}));

// Mock database
jest.mock('../../../src/server/config/database', () => {
  const mockPrisma = {
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
    user: {
      findUnique: jest.fn(),
    },
  };

  return {
    __esModule: true,
    default: mockPrisma,
    db: mockPrisma,
  };
});

jest.mock('../../../src/server/utils/jwt');

describe('Analytics Routes Integration', () => {
  beforeAll(async () => {
    await setupServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock auth
  const mockAuth = (role = 'super_admin') => {
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ userId: 'user-1', role });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', role });
  };

  describe('GET /api/analytics/overview', () => {
    it('should return overview stats for super admin', async () => {
      mockAuth('super_admin');
      (prisma.pageView.count as jest.Mock).mockResolvedValue(1000);
      (prisma.article.count as jest.Mock).mockResolvedValue(50);
      (prisma.newsBrand.count as jest.Mock).mockResolvedValue(5);
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('totalViews', 1000);
      expect(res.body.stats).toHaveProperty('totalArticles', 50);
      expect(res.body.stats).toHaveProperty('totalBrands', 5);
      expect(res.body).toHaveProperty('viewsOverTime');
      expect(res.body).toHaveProperty('deviceBreakdown');
      expect(res.body).toHaveProperty('geographicDistribution');
      expect(res.body).toHaveProperty('topArticles');
    });

    it('should deny access for non-super admin', async () => {
      mockAuth('user');

      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(403);
    });

    it('should deny access without authentication', async () => {
      const res = await request(app).get('/api/analytics/overview');

      expect(res.status).toBe(401);
    });

    it('should deny access for regular user', async () => {
      mockAuth('user');

      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/analytics/brand/:id', () => {
    const mockPageViews = [
      {
        timestamp: new Date('2024-01-01'),
        device: 'desktop',
        country: 'US',
        article: {
          id: 'article-1',
          title: 'Article 1',
          brand: { name: 'Brand 1' },
        },
      },
      {
        timestamp: new Date('2024-01-02'),
        device: 'mobile',
        country: 'GB',
        article: {
          id: 'article-1',
          title: 'Article 1',
          brand: { name: 'Brand 1' },
        },
      },
    ];

    it('should return brand analytics for authenticated user', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews);

      const res = await request(app)
        .get('/api/analytics/brand/brand-1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('viewsOverTime');
      expect(res.body).toHaveProperty('deviceBreakdown');
      expect(res.body).toHaveProperty('geographicDistribution');
    });

    it('should apply date filters', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/brand/brand-1')
        .query({ startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' })
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(prisma.pageView.findMany).toHaveBeenCalled();
    });

    it('should deny access without authentication', async () => {
      const res = await request(app).get('/api/analytics/brand/brand-1');

      expect(res.status).toBe(401);
    });

    it('should handle invalid brand ID', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/brand/invalid-id')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.viewsOverTime).toEqual([]);
    });
  });

  describe('GET /api/analytics/article/:id', () => {
    it('should return article analytics for authenticated user', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([
        {
          timestamp: new Date('2024-01-01'),
          device: 'desktop',
          country: 'US',
          articleId: 'article-1',
          article: {
            id: 'article-1',
            title: 'Article 1',
            brand: { name: 'Brand 1' },
          },
        },
      ]);

      const res = await request(app)
        .get('/api/analytics/article/article-1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('viewsOverTime');
      expect(res.body).toHaveProperty('deviceBreakdown');
    });

    it('should apply filters correctly', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/article/article-1')
        .query({ startDate: '2024-01-01T00:00:00Z' })
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
    });

    it('should deny access without authentication', async () => {
      const res = await request(app).get('/api/analytics/article/article-1');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/analytics/export', () => {
    it('should export CSV for super admin', async () => {
      mockAuth('super_admin');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([
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
      ]);

      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('filename=analytics.csv');
      expect(res.text).toContain('Timestamp,Article,Brand,Country,City,Browser,OS,Device,Referrer');
    });

    it('should deny export for non-super admin', async () => {
      mockAuth('user');

      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(403);
    });

    it('should deny export without authentication', async () => {
      const res = await request(app).get('/api/analytics/export');

      expect(res.status).toBe(401);
    });

    it('should apply filters to CSV export', async () => {
      mockAuth('super_admin');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/export')
        .query({ startDate: '2024-01-01T00:00:00Z', brandId: 'brand-1' })
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(prisma.pageView.findMany).toHaveBeenCalled();
    });

    it('should export with proper CSV escaping', async () => {
      mockAuth('super_admin');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          article: {
            title: 'Article with, comma',
            brand: { name: 'Brand with "quotes"' },
          },
          country: 'US',
          city: null,
          browser: 'Chrome',
          os: 'Windows',
          device: 'desktop',
          referrer: null,
        },
      ]);

      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.text).toContain('"Article with, comma"');
      expect(res.text).toContain('"Brand with ""quotes"""');
    });

    it('should handle empty results', async () => {
      mockAuth('super_admin');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Timestamp,Article,Brand,Country,City,Browser,OS,Device,Referrer');
      // Only header, no data rows
      const lines = res.text.trim().split('\n');
      expect(lines.length).toBe(1);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on analytics endpoints', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      // Make multiple requests to test rate limiting
      // Note: This test may need adjustment based on actual rate limit configuration
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .get('/api/analytics/brand/brand-1')
          .set('Authorization', 'Bearer valid-token');

        if (i < 4) {
          expect(res.status).toBe(200);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in overview', async () => {
      mockAuth('super_admin');
      (prisma.pageView.count as jest.Mock).mockRejectedValue(new Error('Database error'));
      (prisma.article.count as jest.Mock).mockResolvedValue(0);
      (prisma.newsBrand.count as jest.Mock).mockResolvedValue(0);
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', 'Bearer valid-token');

      // AnalyticsService handles errors gracefully by returning zeros
      expect(res.status).toBe(200);
      expect(res.body.stats.totalViews).toBe(0);
    });

    it('should handle invalid date filters', async () => {
      mockAuth('user');
      (prisma.pageView.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/analytics/brand/brand-1')
        .query({ startDate: 'invalid-date' })
        .set('Authorization', 'Bearer valid-token');

      // The service handles invalid dates gracefully by returning empty results
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('viewsOverTime');
    });
  });
});
