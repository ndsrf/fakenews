import { Request, Response } from 'express';
import { TemplateService } from '../services/templateService.js';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['default', 'custom', 'extracted']),
  brandId: z.string().uuid().optional(),
  cssStyles: z.string().min(1),
  htmlStructure: z.string().min(1),
  hasSidebar: z.boolean().default(true),
  language: z.enum(['en', 'es']).default('en'),
  sourceUrl: z.string().url().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  cssStyles: z.string().optional(),
  htmlStructure: z.string().optional(),
  hasSidebar: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const extractTemplateSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  brandId: z.string().uuid().optional(),
});

export class TemplateController {
  static async createTemplate(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const validatedData = createTemplateSchema.parse(req.body);

      const template = await TemplateService.createTemplate(validatedData);

      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  static async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await TemplateService.getTemplate(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      console.error('Error getting template:', error);
      res.status(500).json({ error: 'Failed to get template' });
    }
  }

  static async listTemplates(req: Request, res: Response) {
    try {
      const { brandId, language, isActive, type } = req.query;

      const filters: any = {};
      if (brandId) filters.brandId = brandId as string;
      if (language) filters.language = language as 'en' | 'es';
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (type) filters.type = type as string;

      const templates = await TemplateService.listTemplates(filters);

      res.json(templates);
    } catch (error) {
      console.error('Error listing templates:', error);
      res.status(500).json({ error: 'Failed to list templates' });
    }
  }

  static async updateTemplate(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const validatedData = updateTemplateSchema.parse(req.body);

      const template = await TemplateService.updateTemplate(id, validatedData);

      res.json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  static async deleteTemplate(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      await TemplateService.deleteTemplate(id);

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  static async extractTemplate(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const validatedData = extractTemplateSchema.parse(req.body);

      const template = await TemplateService.extractFromUrl(
        validatedData.url,
        validatedData.name,
        validatedData.brandId
      );

      res.status(201).json(template);
    } catch (error) {
      console.error('Error extracting template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to extract template' });
    }
  }
}
