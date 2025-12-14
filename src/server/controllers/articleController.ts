import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AIService } from '../services/aiService.js';
import slugifyLib from 'slugify';
import { z } from 'zod';

const slugify = slugifyLib.default || slugifyLib;

const generateArticleSchema = z.object({
  brandId: z.string().min(1),
  topic: z.string().min(1),
  tone: z.enum(['serious', 'satirical', 'dramatic', 'investigative']),
  length: z.enum(['short', 'medium', 'long']),
  category: z.string().min(1),
  includeQuotes: z.boolean().default(false),
  includeStatistics: z.boolean().default(false),
  includeCharts: z.boolean().default(false),
  generateRelatedTitles: z.number().int().min(3).max(5).default(3),
  language: z.enum(['en', 'es']).default('en'),
  aiProvider: z.enum(['openai', 'anthropic', 'gemini']),
  templateId: z.string().min(1),
});

const createArticleSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  language: z.enum(['en', 'es']),
  category: z.string().min(1),
  templateId: z.string().min(1),
  brandId: z.string().min(1),
  authorName: z.string().min(1),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  relatedArticles: z.array(z.any()).default([]),
});

const updateArticleSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  authorName: z.string().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export class ArticleController {
  static async generateArticle(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const validatedData = generateArticleSchema.parse(req.body);

      const brand = await db.newsBrand.findUnique({
        where: { id: validatedData.brandId },
      });

      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }

      const template = await db.template.findUnique({
        where: { id: validatedData.templateId },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const generatedArticle = await AIService.generateArticle({
        ...validatedData,
        brandName: brand.name,
      });

      const slug = slugify(generatedArticle.title, {
        lower: true,
        strict: true,
      });

      const publishDate = new Date();
      const year = publishDate.getFullYear();
      const month = String(publishDate.getMonth() + 1).padStart(2, '0');

      const uniqueSlug = `${slug}-${Date.now()}`;

      const article = await db.article.create({
        data: {
          title: generatedArticle.title,
          subtitle: generatedArticle.subtitle,
          content: generatedArticle.content,
          excerpt: generatedArticle.excerpt,
          language: validatedData.language,
          category: validatedData.category,
          template: { connect: { id: validatedData.templateId } },
          brand: { connect: { id: validatedData.brandId } },
          author: { connect: { id: user.userId } },
          authorName: generatedArticle.authorName,
          slug: uniqueSlug,
          metadata: JSON.stringify({
            tone: validatedData.tone,
            length: validatedData.length,
            aiProvider: validatedData.aiProvider,
            generatedAt: new Date().toISOString(),
          }),
          images: JSON.stringify(generatedArticle.images),
          charts: JSON.stringify(generatedArticle.charts),
          relatedArticles: JSON.stringify(generatedArticle.relatedTitles),
          featuredImage: generatedArticle.featuredImage,
          readTime: generatedArticle.readTime,
          tags: JSON.stringify(generatedArticle.tags),
          status: 'draft',
        },
      });

      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error generating article:', error);
      res.status(500).json({ error: 'Failed to generate article' });
    }
  }

  static async createArticle(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const validatedData = createArticleSchema.parse(req.body);

      const slug = slugify(validatedData.title, {
        lower: true,
        strict: true,
      });

      const uniqueSlug = `${slug}-${Date.now()}`;

      const article = await db.article.create({
        data: {
          title: validatedData.title,
          subtitle: validatedData.subtitle,
          content: validatedData.content,
          excerpt: validatedData.excerpt,
          language: validatedData.language,
          category: validatedData.category,
          templateId: validatedData.templateId,
          brandId: validatedData.brandId,
          authorId: user.userId,
          authorName: validatedData.authorName,
          slug: uniqueSlug,
          metadata: JSON.stringify({}),
          images: JSON.stringify([]),
          charts: JSON.stringify([]),
          relatedArticles: JSON.stringify(validatedData.relatedArticles),
          featuredImage: validatedData.featuredImage,
          tags: JSON.stringify(validatedData.tags),
          status: 'draft',
        },
      });

      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error creating article:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  }

  static async getArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const article = await db.article.findUnique({
        where: { id },
        include: {
          brand: true,
          template: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      console.error('Error getting article:', error);
      res.status(500).json({ error: 'Failed to get article' });
    }
  }

  static async listArticles(req: Request, res: Response) {
    try {
      const {
        brandId,
        language,
        category,
        status,
        authorId,
        page = '1',
        limit = '20',
      } = req.query;

      const where: any = {};

      if (brandId) where.brandId = brandId;
      if (language) where.language = language;
      if (category) where.category = category;
      if (status) where.status = status;
      if (authorId) where.authorId = authorId;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const [articles, total] = await Promise.all([
        db.article.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        db.article.count({ where }),
      ]);

      res.json({
        articles,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('Error listing articles:', error);
      res.status(500).json({ error: 'Failed to list articles' });
    }
  }

  static async updateArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const validatedData = updateArticleSchema.parse(req.body);

      const article = await db.article.findUnique({
        where: { id },
      });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.authorId !== user.userId && user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updateData: any = {};

      if (validatedData.title !== undefined) updateData.title = validatedData.title;
      if (validatedData.subtitle !== undefined) updateData.subtitle = validatedData.subtitle;
      if (validatedData.content !== undefined) updateData.content = validatedData.content;
      if (validatedData.excerpt !== undefined) updateData.excerpt = validatedData.excerpt;
      if (validatedData.category !== undefined) updateData.category = validatedData.category;
      if (validatedData.authorName !== undefined) updateData.authorName = validatedData.authorName;
      if (validatedData.featuredImage !== undefined)
        updateData.featuredImage = validatedData.featuredImage;
      if (validatedData.tags !== undefined) updateData.tags = JSON.stringify(validatedData.tags);
      if (validatedData.status !== undefined) updateData.status = validatedData.status;

      if (validatedData.title && validatedData.title !== article.title) {
        const slug = slugify(validatedData.title, {
          lower: true,
          strict: true,
        });
        updateData.slug = `${slug}-${Date.now()}`;
      }

      const updatedArticle = await db.article.update({
        where: { id },
        data: updateData,
      });

      res.json(updatedArticle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error updating article:', error);
      res.status(500).json({ error: 'Failed to update article' });
    }
  }

  static async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const article = await db.article.findUnique({
        where: { id },
      });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.authorId !== user.userId && user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await db.article.delete({
        where: { id },
      });

      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  }

  static async publishArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const article = await db.article.findUnique({
        where: { id },
      });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.authorId !== user.userId && user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updatedArticle = await db.article.update({
        where: { id },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      });

      res.json(updatedArticle);
    } catch (error) {
      console.error('Error publishing article:', error);
      res.status(500).json({ error: 'Failed to publish article' });
    }
  }

  static async getArticleBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const article = await db.article.findFirst({
        where: {
          slug,
          status: 'published'
        },
        include: {
          brand: true,
          template: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      console.error('Error getting article by slug:', error);
      res.status(500).json({ error: 'Failed to get article' });
    }
  }
}
