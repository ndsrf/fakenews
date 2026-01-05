import { Request, Response } from 'express';
import { PublicController } from '../../../src/server/controllers/publicController';
import { db } from '../../../src/server/config/database';
import { marked } from 'marked';

jest.mock('../../../src/server/config/database', () => ({
  db: {
    newsBrand: {
      findFirst: jest.fn(),
    },
    article: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('marked');

describe('PublicController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { json, status };
    req = {
      params: {},
    } as any;

    jest.clearAllMocks();
  });

  describe('viewArticle', () => {
    const validParams = {
      brandSlug: 'test-brand',
      year: '2024',
      month: '01',
      slug: 'test-article-123',
    };

    const mockBrand = {
      id: 'brand-123',
      name: 'Test Brand',
      tagline: 'Tagline',
      description: 'Description',
      logoUrl: 'http://example.com/logo.png',
      primaryColor: '#000000',
      accentColor: '#ffffff',
      websiteUrl: 'http://example.com',
    };

    const mockArticle = {
      id: 'article-123',
      title: 'Test Article',
      subtitle: 'Subtitle',
      content: '# Test Content',
      excerpt: 'Excerpt',
      slug: 'test-article-123',
      language: 'en',
      category: 'Tech',
      authorName: 'Author',
      featuredImage: 'http://example.com/image.png',
      tags: '["tag1", "tag2"]',
      publishedAt: new Date('2024-01-15'),
      brandId: 'brand-123',
      status: 'published',
      brand: mockBrand,
      template: { id: 'template-123' },
      relatedArticles: '["Article 1", "Article 2"]',
    };

    it('should return published article successfully', async () => {
      req.params = validParams;
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);
      (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);
      (marked as jest.Mock).mockResolvedValue('<h1>Test Content</h1>');

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'article-123',
        title: 'Test Article',
        content: '<h1>Test Content</h1>',
        brand: expect.objectContaining({
          id: 'brand-123',
          name: 'Test Brand',
        }),
        relatedArticles: ['Article 1', 'Article 2'],
      }));
    });

    it('should return 404 if brand not found', async () => {
      req.params = validParams;
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(null);

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Article not found' });
    });

    it('should return 404 if article not found', async () => {
      req.params = validParams;
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);
      (db.article.findFirst as jest.Mock).mockResolvedValue(null);

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Article not found' });
    });

    it('should return 404 if year does not match', async () => {
      req.params = { ...validParams, year: '2023' };
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);
      (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Article not found' });
    });

    it('should return 404 if month does not match', async () => {
      req.params = { ...validParams, month: '02' };
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);
      (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Article not found' });
    });

    it('should handle invalid params', async () => {
      req.params = { ...validParams, year: 'invalid' };

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid request parameters',
      }));
    });

    it('should handle malformed related articles JSON', async () => {
      req.params = validParams;
      const articleWithBadJSON = { ...mockArticle, relatedArticles: 'invalid json' };
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);
      (db.article.findFirst as jest.Mock).mockResolvedValue(articleWithBadJSON);
      (marked as jest.Mock).mockResolvedValue('<h1>Test Content</h1>');

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        relatedArticles: [],
      }));
    });

    it('should handle database errors', async () => {
      req.params = validParams;
      (db.newsBrand.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should parse tags from JSON string', async () => {
      req.params = validParams;
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);
      (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);
      (marked as jest.Mock).mockResolvedValue('<h1>Test Content</h1>');

      await PublicController.viewArticle(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        tags: ['tag1', 'tag2'],
      }));
    });

    it('should only show published articles', async () => {
      req.params = validParams;
      (db.newsBrand.findFirst as jest.Mock).mockResolvedValue(mockBrand);

      await PublicController.viewArticle(req as Request, res as Response);

      expect(db.article.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'published',
        }),
      }));
    });
  });
});
