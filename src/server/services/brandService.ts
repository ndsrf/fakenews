import { PrismaClient, NewsBrand } from '@prisma/client';
import { db } from '../config/database.js';

export interface CreateBrandInput {
  name: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  language: 'en' | 'es';
  websiteUrl: string;
  categories: string[];
  isActive?: boolean;
}

export interface UpdateBrandInput {
  name?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  logoVariations?: any;
  logoMetadata?: any;
  primaryColor?: string;
  accentColor?: string;
  language?: 'en' | 'es';
  websiteUrl?: string;
  categories?: string[];
  isActive?: boolean;
}

export class BrandService {
  static async createBrand(input: CreateBrandInput): Promise<NewsBrand> {
    const brand = await db.newsBrand.create({
      data: {
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        logoUrl: input.logoUrl,
        primaryColor: input.primaryColor || '#1a1a1a',
        accentColor: input.accentColor || '#0066cc',
        language: input.language,
        websiteUrl: input.websiteUrl,
        categories: JSON.stringify(input.categories),
        isActive: input.isActive !== undefined ? input.isActive : true,
      },
    });

    return brand;
  }

  static async getBrand(id: string): Promise<NewsBrand | null> {
    const brand = await db.newsBrand.findUnique({
      where: { id },
      include: {
        articles: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        templates: {
          where: { isActive: true },
        },
      },
    });

    return brand;
  }

  static async listBrands(filters?: {
    language?: 'en' | 'es';
    isActive?: boolean;
  }): Promise<NewsBrand[]> {
    const where: any = {};

    if (filters?.language) {
      where.language = filters.language;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const brands = await db.newsBrand.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            articles: true,
            templates: true,
          },
        },
      },
    });

    return brands;
  }

  static async updateBrand(
    id: string,
    input: UpdateBrandInput
  ): Promise<NewsBrand> {
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.tagline !== undefined) updateData.tagline = input.tagline;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl;
    if (input.logoVariations !== undefined)
      updateData.logoVariations = JSON.stringify(input.logoVariations);
    if (input.logoMetadata !== undefined)
      updateData.logoMetadata = JSON.stringify(input.logoMetadata);
    if (input.primaryColor !== undefined) updateData.primaryColor = input.primaryColor;
    if (input.accentColor !== undefined) updateData.accentColor = input.accentColor;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.websiteUrl !== undefined) updateData.websiteUrl = input.websiteUrl;
    if (input.categories !== undefined)
      updateData.categories = JSON.stringify(input.categories);
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const brand = await db.newsBrand.update({
      where: { id },
      data: updateData,
    });

    return brand;
  }

  static async deleteBrand(id: string): Promise<void> {
    await db.newsBrand.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async getBrandBySlug(slug: string): Promise<NewsBrand | null> {
    const brands = await db.newsBrand.findMany({
      where: { isActive: true },
    });

    const brand = brands.find((b) => this.slugify(b.name) === slug);
    return brand || null;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
