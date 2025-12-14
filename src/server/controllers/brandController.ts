import { Request, Response } from 'express';
import { BrandService } from '../services/brandService.js';
import { LogoGeneratorService } from '../services/logoGeneratorService.js';
import { z } from 'zod';

const createBrandSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().min(1),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1a1a1a'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0066cc'),
  language: z.enum(['en', 'es']).default('en'),
  websiteUrl: z.string().url(),
  categories: z.array(z.string()).min(1),
  isActive: z.boolean().default(true),
});

const updateBrandSchema = z.object({
  name: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  logoVariations: z.any().optional(),
  logoMetadata: z.any().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  language: z.enum(['en', 'es']).optional(),
  websiteUrl: z.string().url().optional(),
  categories: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const generateLogoSchema = z.object({
  brandName: z.string().min(1),
  style: z.enum(['modern', 'classic', 'minimalist', 'vintage', 'tech', 'editorial']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  aiProvider: z.enum(['openai', 'anthropic', 'gemini'], {
    required_error: 'AI provider must be specified (openai, anthropic, or gemini)',
  }),
  useAI: z.boolean().default(false),
});

export class BrandController {
  static async createBrand(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const validatedData = createBrandSchema.parse(req.body);

      const brand = await BrandService.createBrand(validatedData);

      res.status(201).json(brand);
    } catch (error) {
      console.error('Error creating brand:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create brand' });
    }
  }

  static async getBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const brand = await BrandService.getBrand(id);

      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }

      res.json(brand);
    } catch (error) {
      console.error('Error getting brand:', error);
      res.status(500).json({ error: 'Failed to get brand' });
    }
  }

  static async listBrands(req: Request, res: Response) {
    try {
      const { language, isActive } = req.query;

      const filters: any = {};
      if (language) filters.language = language as 'en' | 'es';
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const brands = await BrandService.listBrands(filters);

      res.json(brands);
    } catch (error) {
      console.error('Error listing brands:', error);
      res.status(500).json({ error: 'Failed to list brands' });
    }
  }

  static async updateBrand(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const validatedData = updateBrandSchema.parse(req.body);

      const brand = await BrandService.updateBrand(id, validatedData);

      res.json(brand);
    } catch (error) {
      console.error('Error updating brand:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update brand' });
    }
  }

  static async deleteBrand(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      await BrandService.deleteBrand(id);

      res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
      console.error('Error deleting brand:', error);
      res.status(500).json({ error: 'Failed to delete brand' });
    }
  }

  static async generateLogo(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const validatedData = generateLogoSchema.parse(req.body);

      let aiLogoUrl: string | null = null;

      if (validatedData.useAI) {
        aiLogoUrl = await LogoGeneratorService.generateAILogo({
          brandName: validatedData.brandName,
          style: validatedData.style,
          primaryColor: validatedData.primaryColor,
          accentColor: validatedData.accentColor,
          aiProvider: validatedData.aiProvider,
        });
      }

      const { variations, metadata } = await LogoGeneratorService.generateLogo({
        brandName: validatedData.brandName,
        style: validatedData.style,
        primaryColor: validatedData.primaryColor,
        accentColor: validatedData.accentColor,
        aiProvider: validatedData.aiProvider,
      });

      res.json({
        variations,
        metadata,
        aiGenerated: aiLogoUrl,
      });
    } catch (error) {
      console.error('Error generating logo:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate logo' });
    }
  }
}
