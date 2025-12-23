import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app, setupServer } from '../../../src/server/index';
import prisma from '../../../src/server/config/database';

// Mock the marked package to avoid ES module issues
jest.mock('marked', () => ({
  marked: jest.fn((text: string) => Promise.resolve(`<p>${text}</p>`)),
}));

// Mock database
jest.mock('../../../src/server/config/database', () => {
  const mockPrisma = {
    article: {
      findFirst: jest.fn(),
    },
    newsBrand: {
      findFirst: jest.fn(),
    },
    pageView: {
      create: jest.fn(),
    },
  };

  return {
    __esModule: true,
    default: mockPrisma,
    db: mockPrisma,
  };
});

// Mock analytics middleware to prevent actual tracking
jest.mock('../../../src/server/middleware/analytics', () => ({
  trackPageView: (req: any, res: any, next: any) => next(),
}));

describe('Public Article Routes Integration', () => {
  beforeAll(async () => {
    await setupServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /:brandSlug/article/:year/:month/:slug', () => {
    const mockPublishedArticle = {
      id: 'article-1',
      title: 'Test Article',
      slug: 'test-article',
      content: 'Test content',
      status: 'published',
      publishedAt: new Date('2024-01-15'),
      year: 2024,
      month: 1,
      brand: {
        id: 'brand-1',
        name: 'Test Brand',
        slug: 'test-brand',
      },
      template: {
        id: 'template-1',
        name: 'Template 1',
      },
      relatedArticles: [],
    };

    const mockDraftArticle = {
      ...mockPublishedArticle,
      id: 'article-2',
      status: 'draft',
    };

    it('should return published article with 200', async () => {
      (prisma.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockPublishedArticle.brand);
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(mockPublishedArticle);

      const res = await request(app).get('/test-brand/article/2024/01/test-article');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'article-1');
      expect(res.body).toHaveProperty('title', 'Test Article');
      expect(res.body).toHaveProperty('brand');
      expect(res.body.brand).toHaveProperty('name', 'Test Brand');
    });

    it('should return 404 for draft article', async () => {
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/test-brand/article/2024/01/draft-article');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent article', async () => {
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/test-brand/article/2024/01/non-existent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for wrong brand slug', async () => {
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/wrong-brand/article/2024/01/test-article');

      expect(res.status).toBe(404);
    });

    it('should return 404 for wrong year/month', async () => {
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/test-brand/article/2025/12/test-article');

      expect(res.status).toBe(404);
    });

    it('should include related articles in response', async () => {
      const articleWithRelated = {
        ...mockPublishedArticle,
        relatedArticles: [
          {
            id: 'article-3',
            title: 'Related Article',
            slug: 'related-article',
          },
        ],
      };

      (prisma.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockPublishedArticle.brand);
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(articleWithRelated);

      const res = await request(app).get('/test-brand/article/2024/01/test-article');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('relatedArticles');
      expect(Array.isArray(res.body.relatedArticles)).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.newsBrand.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/test-brand/article/2024/01/test-article');

      expect(res.status).toBe(500);
    });

    it('should validate URL parameters', async () => {
      const res = await request(app).get('/test-brand/article/invalid/month/test-article');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
