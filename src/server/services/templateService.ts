import { PrismaClient, Template } from '@prisma/client';
import { db } from '../config/database.js';
import { TemplateScraperService } from './templateScraperService.js';

export interface CreateTemplateInput {
  name: string;
  type: 'default' | 'custom' | 'extracted';
  brandId?: string;
  cssStyles: string;
  htmlStructure: string;
  hasSidebar?: boolean;
  language?: 'en' | 'es';
  sourceUrl?: string;
  extractionMethod?: string;
  layoutMetadata?: any;
}

export interface UpdateTemplateInput {
  name?: string;
  cssStyles?: string;
  htmlStructure?: string;
  hasSidebar?: boolean;
  isActive?: boolean;
  previewImage?: string;
}

export class TemplateService {
  static async createTemplate(input: CreateTemplateInput): Promise<Template> {
    const template = await db.template.create({
      data: {
        name: input.name,
        type: input.type,
        brandId: input.brandId,
        cssStyles: input.cssStyles,
        htmlStructure: input.htmlStructure,
        hasSidebar: input.hasSidebar !== undefined ? input.hasSidebar : true,
        language: input.language || 'en',
        sourceUrl: input.sourceUrl,
        extractionMethod: input.extractionMethod,
        layoutMetadata: input.layoutMetadata ? JSON.stringify(input.layoutMetadata) : null,
        isActive: true,
      },
    });

    return template;
  }

  static async getTemplate(id: string): Promise<Template | null> {
    const template = await db.template.findUnique({
      where: { id },
      include: {
        brand: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    return template;
  }

  static async listTemplates(filters?: {
    brandId?: string;
    language?: 'en' | 'es';
    isActive?: boolean;
    type?: string;
  }): Promise<Template[]> {
    const where: any = {};

    if (filters?.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters?.language) {
      where.language = filters.language;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const templates = await db.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    return templates;
  }

  static async updateTemplate(
    id: string,
    input: UpdateTemplateInput
  ): Promise<Template> {
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.cssStyles !== undefined) updateData.cssStyles = input.cssStyles;
    if (input.htmlStructure !== undefined) updateData.htmlStructure = input.htmlStructure;
    if (input.hasSidebar !== undefined) updateData.hasSidebar = input.hasSidebar;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.previewImage !== undefined) updateData.previewImage = input.previewImage;

    const template = await db.template.update({
      where: { id },
      data: updateData,
    });

    return template;
  }

  static async deleteTemplate(id: string): Promise<void> {
    await db.template.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async extractFromUrl(
    url: string,
    name: string,
    brandId?: string
  ): Promise<Template> {
    try {
      const extracted = await TemplateScraperService.extractTemplate(url);

      const generatedCSS = TemplateScraperService.generateTemplateCSS(
        extracted.layoutMetadata
      );

      const template = await this.createTemplate({
        name,
        type: 'extracted',
        brandId,
        cssStyles: generatedCSS,
        htmlStructure: extracted.htmlStructure,
        hasSidebar: extracted.hasSidebar,
        sourceUrl: url,
        extractionMethod: 'puppeteer',
        layoutMetadata: extracted.layoutMetadata,
      });

      if (extracted.previewImage) {
        await this.updateTemplate(template.id, {
          previewImage: extracted.previewImage,
        });
      }

      return template;
    } catch (error) {
      console.error('Error extracting template from URL:', error);
      throw new Error('Failed to extract template from URL');
    }
  }

  static async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Modern Article',
        type: 'default',
        cssStyles: this.getDefaultModernCSS(),
        htmlStructure: this.getDefaultHTMLStructure(),
        hasSidebar: true,
        language: 'en',
      },
      {
        name: 'Classic Editorial',
        type: 'default',
        cssStyles: this.getDefaultClassicCSS(),
        htmlStructure: this.getDefaultHTMLStructure(),
        hasSidebar: true,
        language: 'en',
      },
      {
        name: 'Minimalist',
        type: 'default',
        cssStyles: this.getDefaultMinimalistCSS(),
        htmlStructure: this.getDefaultHTMLStructure(),
        hasSidebar: false,
        language: 'en',
      },
    ];

    for (const template of defaultTemplates) {
      const existing = await db.template.findFirst({
        where: { name: template.name, type: 'default' },
      });

      if (!existing) {
        await this.createTemplate(template as CreateTemplateInput);
      }
    }
  }

  private static getDefaultHTMLStructure(): string {
    return `<main class="article-container">
  <article class="article-content">
    <header class="article-header">
      <h1 class="article-title"><!-- Title --></h1>
      <p class="article-subtitle"><!-- Subtitle --></p>
      <div class="article-meta">
        <span class="author"><!-- Author --></span>
        <span class="date"><!-- Date --></span>
        <span class="read-time"><!-- Read Time --></span>
      </div>
    </header>

    <div class="article-body">
      <!-- Content -->
    </div>
  </article>

  <aside class="sidebar">
    <div class="related-articles">
      <h3>Related Articles</h3>
      <!-- Related articles list -->
    </div>
  </aside>
</main>`;
  }

  private static getDefaultModernCSS(): string {
    return `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 18px;
  line-height: 1.7;
  color: #1a1a1a;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
}

.article-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 60px;
}

.article-content {
  max-width: 800px;
}

.article-header {
  margin-bottom: 40px;
}

.article-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  color: #000000;
}

.article-subtitle {
  font-size: 1.5rem;
  color: #666666;
  margin-bottom: 24px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 20px;
  color: #888888;
  font-size: 0.95rem;
}

.article-body {
  font-size: 1.125rem;
  line-height: 1.8;
}

.article-body h2 {
  font-size: 2rem;
  margin-top: 48px;
  margin-bottom: 20px;
  font-weight: 700;
}

.article-body h3 {
  font-size: 1.5rem;
  margin-top: 36px;
  margin-bottom: 16px;
  font-weight: 600;
}

.article-body p {
  margin-bottom: 24px;
}

.sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.related-articles h3 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .article-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .sidebar {
    position: static;
  }

  .article-title {
    font-size: 2.5rem;
  }
}
`.trim();
  }

  private static getDefaultClassicCSS(): string {
    return `
body {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 18px;
  line-height: 1.8;
  color: #2a2a2a;
  background-color: #f8f8f8;
  margin: 0;
  padding: 0;
}

.article-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  background-color: #ffffff;
}

.article-header {
  border-bottom: 3px solid #1a1a1a;
  padding-bottom: 30px;
  margin-bottom: 40px;
}

.article-title {
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 12px;
  color: #1a1a1a;
  font-family: 'Baskerville', 'Palatino Linotype', serif;
}

.article-subtitle {
  font-size: 1.35rem;
  font-style: italic;
  color: #555555;
  margin-bottom: 20px;
}

.article-meta {
  font-size: 0.9rem;
  color: #777777;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.article-body p {
  text-align: justify;
  margin-bottom: 20px;
}

.article-body h2 {
  font-size: 1.85rem;
  margin-top: 40px;
  margin-bottom: 18px;
  border-bottom: 1px solid #dddddd;
  padding-bottom: 8px;
}

.sidebar {
  padding-top: 20px;
  border-left: 1px solid #dddddd;
  padding-left: 40px;
}

@media (max-width: 1024px) {
  .article-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-left: none;
    border-top: 1px solid #dddddd;
    padding-left: 0;
    padding-top: 40px;
  }
}
`.trim();
  }

  private static getDefaultMinimalistCSS(): string {
    return `
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 18px;
  line-height: 1.75;
  color: #333333;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
}

.article-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 80px 20px;
}

.article-header {
  margin-bottom: 60px;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 300;
  line-height: 1.3;
  margin-bottom: 20px;
  color: #000000;
  letter-spacing: -0.5px;
}

.article-subtitle {
  font-size: 1.25rem;
  font-weight: 300;
  color: #666666;
  margin-bottom: 30px;
}

.article-meta {
  font-size: 0.875rem;
  color: #999999;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.article-body {
  font-weight: 300;
}

.article-body p {
  margin-bottom: 28px;
}

.article-body h2 {
  font-size: 1.75rem;
  font-weight: 400;
  margin-top: 60px;
  margin-bottom: 24px;
}

.article-body h3 {
  font-size: 1.35rem;
  font-weight: 400;
  margin-top: 40px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
}
`.trim();
  }
}
