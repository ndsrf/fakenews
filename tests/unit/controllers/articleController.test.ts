import { Request, Response } from 'express';
import { ArticleController } from '../../../src/server/controllers/articleController';
import { db } from '../../../src/server/config/database';
import { AIService } from '../../../src/server/services/aiService';

// Mock dependencies
jest.mock('../../../src/server/config/database', () => ({
  db: {
    newsBrand: {
      findUnique: jest.fn(),
    },
    template: {
      findUnique: jest.fn(),
    },
    article: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../../src/server/services/aiService', () => ({
  AIService: {
    generateArticle: jest.fn(),
  },
}));

describe('ArticleController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  const mockUser = { id: 'user-123', role: 'user', email: 'test@example.com' };

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { json, status };
    req = {
      body: {},
      params: {},
      query: {},
      user: mockUser,
    } as any;

    jest.clearAllMocks();
  });

  describe('generateArticle', () => {
    const validBody = {
      brandId: '123e4567-e89b-12d3-a456-426614174000',
      templateId: '123e4567-e89b-12d3-a456-426614174001',
      topic: 'Test Topic',
      tone: 'serious',
      length: 'short',
      category: 'Tech',
      includeQuotes: false,
      includeStatistics: false,
      includeCharts: false,
      generateRelatedTitles: 3,
      language: 'en',
      aiProvider: 'openai',
    };

    it('should generate article successfully', async () => {
      req.body = validBody;
      (db.newsBrand.findUnique as jest.Mock).mockResolvedValue({ id: validBody.brandId, name: 'Brand' });
      (db.template.findUnique as jest.Mock).mockResolvedValue({ id: validBody.templateId });
      
      const mockGenerated = {
        title: 'Generated Title',
        content: 'Content',
        excerpt: 'Excerpt',
        authorName: 'Author',
        images: [],
        charts: [],
        relatedTitles: [],
        tags: [],
        readTime: 5
      };
      (AIService.generateArticle as jest.Mock).mockResolvedValue(mockGenerated);
      (db.article.create as jest.Mock).mockResolvedValue({ id: 'article-123', ...mockGenerated });

      await ArticleController.generateArticle(req as Request, res as Response);

      expect(db.newsBrand.findUnique).toHaveBeenCalled();
      expect(db.template.findUnique).toHaveBeenCalled();
      expect(AIService.generateArticle).toHaveBeenCalled();
      expect(db.article.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if brand not found', async () => {
      req.body = validBody;
      (db.newsBrand.findUnique as jest.Mock).mockResolvedValue(null);

      await ArticleController.generateArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Brand not found' });
    });

    it('should return 404 if template not found', async () => {
      req.body = validBody;
      (db.newsBrand.findUnique as jest.Mock).mockResolvedValue({ id: validBody.brandId });
      (db.template.findUnique as jest.Mock).mockResolvedValue(null);

      await ArticleController.generateArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Template not found' });
    });

    it('should return 400 for validation error', async () => {
      req.body = { ...validBody, topic: '' }; // Invalid topic

      await ArticleController.generateArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid input' }));
    });
  });

  describe('createArticle', () => {
    const validBody = {
      title: 'Title',
      content: 'Content',
      excerpt: 'Excerpt',
      language: 'en',
      category: 'Tech',
      templateId: '123e4567-e89b-12d3-a456-426614174001',
      brandId: '123e4567-e89b-12d3-a456-426614174000',
      authorName: 'Author',
      featuredImage: 'http://example.com/image.jpg',
      tags: ['tag1'],
      relatedArticles: []
    };

    it('should create article successfully', async () => {
      req.body = validBody;
      (db.article.create as jest.Mock).mockResolvedValue({ id: 'article-123', ...validBody });

      await ArticleController.createArticle(req as Request, res as Response);

      expect(db.article.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 for validation error', async () => {
      req.body = { ...validBody, title: '' };

      await ArticleController.createArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getArticle', () => {
    it('should return article if found', async () => {
      req.params = { id: 'article-123' };
      const mockArticle = { id: 'article-123', title: 'Title' };
      (db.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

      await ArticleController.getArticle(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockArticle);
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 'article-123' };
      (db.article.findUnique as jest.Mock).mockResolvedValue(null);

      await ArticleController.getArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('listArticles', () => {
    it('should list articles with pagination', async () => {
      req.query = { page: '1', limit: '10' };
      (db.article.findMany as jest.Mock).mockResolvedValue([]);
      (db.article.count as jest.Mock).mockResolvedValue(0);

      await ArticleController.listArticles(req as Request, res as Response);

      expect(db.article.findMany).toHaveBeenCalled();
      expect(db.article.count).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pagination: expect.any(Object)
      }));
    });
  });

  describe('updateArticle', () => {
    const updateBody = { title: 'New Title' };

    it('should update article if authorized', async () => {
      req.params = { id: 'article-123' };
      req.body = updateBody;
      (db.article.findUnique as jest.Mock).mockResolvedValue({ id: 'article-123', authorId: 'user-123' });
      (db.article.update as jest.Mock).mockResolvedValue({ id: 'article-123', ...updateBody });

      await ArticleController.updateArticle(req as Request, res as Response);

      expect(db.article.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.params = { id: 'article-123' };
      req.body = updateBody;
      (db.article.findUnique as jest.Mock).mockResolvedValue({ id: 'article-123', authorId: 'other-user' });

      await ArticleController.updateArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 'article-123' };
      req.body = updateBody;
      (db.article.findUnique as jest.Mock).mockResolvedValue(null);

      await ArticleController.updateArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article if authorized', async () => {
      req.params = { id: 'article-123' };
      (db.article.findUnique as jest.Mock).mockResolvedValue({ id: 'article-123', authorId: 'user-123' });

      await ArticleController.deleteArticle(req as Request, res as Response);

      expect(db.article.delete).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.params = { id: 'article-123' };
      (db.article.findUnique as jest.Mock).mockResolvedValue({ id: 'article-123', authorId: 'other-user' });

      await ArticleController.deleteArticle(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('publishArticle', () => {
    it('should publish article if authorized', async () => {
      req.params = { id: 'article-123' };
      (db.article.findUnique as jest.Mock).mockResolvedValue({ id: 'article-123', authorId: 'user-123' });
      (db.article.update as jest.Mock).mockResolvedValue({ id: 'article-123', status: 'published' });

      await ArticleController.publishArticle(req as Request, res as Response);

      expect(db.article.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'published' })
      }));
      expect(res.json).toHaveBeenCalled();
    });
  });
});
