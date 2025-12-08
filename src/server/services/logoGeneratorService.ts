import { AIClientManager } from '../config/ai.js';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export interface LogoGenerationRequest {
  brandName: string;
  style: 'modern' | 'classic' | 'minimalist' | 'vintage' | 'tech' | 'editorial';
  primaryColor: string;
  accentColor?: string;
  aiProvider: 'openai' | 'anthropic' | 'gemini';
}

export interface LogoVariations {
  horizontal: string;
  vertical: string;
  iconOnly: string;
  monochrome: string;
}

export interface LogoMetadata {
  style: string;
  colors: {
    primary: string;
    accent?: string;
  };
  generatedAt: string;
  provider: string;
}

export class LogoGeneratorService {
  private static async ensureUploadDir(): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const brandsDir = path.join(uploadDir, 'brands');
    await fs.mkdir(brandsDir, { recursive: true });
    return brandsDir;
  }

  static async generateLogo(
    request: LogoGenerationRequest
  ): Promise<{ variations: LogoVariations; metadata: LogoMetadata }> {
    try {
      const brandsDir = await this.ensureUploadDir();
      const timestamp = Date.now();
      const baseName = request.brandName.toLowerCase().replace(/\s+/g, '-');

      const svgVariations = await this.generateSVGVariations(request);

      const variations: LogoVariations = {
        horizontal: '',
        vertical: '',
        iconOnly: '',
        monochrome: '',
      };

      for (const [key, svg] of Object.entries(svgVariations)) {
        const svgPath = path.join(brandsDir, `${baseName}-${key}-${timestamp}.svg`);
        const pngPath = path.join(brandsDir, `${baseName}-${key}-${timestamp}.png`);

        await fs.writeFile(svgPath, svg);

        await sharp(Buffer.from(svg))
          .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
          .png()
          .toFile(pngPath);

        variations[key as keyof LogoVariations] = `/uploads/brands/${path.basename(pngPath)}`;
      }

      const metadata: LogoMetadata = {
        style: request.style,
        colors: {
          primary: request.primaryColor,
          accent: request.accentColor,
        },
        generatedAt: new Date().toISOString(),
        provider: request.aiProvider,
      };

      return { variations, metadata };
    } catch (error) {
      console.error('Error generating logo:', error);
      throw new Error('Failed to generate logo');
    }
  }

  private static async generateSVGVariations(
    request: LogoGenerationRequest
  ): Promise<Record<string, string>> {
    const horizontal = this.createTextLogo(request, 'horizontal');
    const vertical = this.createTextLogo(request, 'vertical');
    const iconOnly = this.createIconLogo(request);
    const monochrome = this.createTextLogo(
      { ...request, primaryColor: '#000000', accentColor: '#000000' },
      'horizontal'
    );

    return {
      horizontal,
      vertical,
      iconOnly,
      monochrome,
    };
  }

  private static createTextLogo(
    request: LogoGenerationRequest,
    orientation: 'horizontal' | 'vertical'
  ): string {
    const { brandName, primaryColor, style } = request;
    const isVertical = orientation === 'vertical';

    const getFontFamily = (): string => {
      switch (style) {
        case 'modern':
          return 'Arial, Helvetica, sans-serif';
        case 'classic':
          return 'Georgia, Times New Roman, serif';
        case 'minimalist':
          return 'Helvetica Neue, Arial, sans-serif';
        case 'vintage':
          return 'Courier New, monospace';
        case 'tech':
          return 'Consolas, Monaco, monospace';
        case 'editorial':
          return 'Baskerville, Palatino, serif';
        default:
          return 'Arial, sans-serif';
      }
    };

    const getFontWeight = (): string => {
      switch (style) {
        case 'modern':
        case 'tech':
          return 'bold';
        case 'classic':
        case 'editorial':
          return 'normal';
        case 'minimalist':
          return '300';
        case 'vintage':
          return 'bold';
        default:
          return 'normal';
      }
    };

    const getLetterSpacing = (): string => {
      switch (style) {
        case 'modern':
          return '2px';
        case 'classic':
        case 'editorial':
          return '1px';
        case 'minimalist':
          return '3px';
        case 'vintage':
          return '0px';
        case 'tech':
          return '1px';
        default:
          return '0px';
      }
    };

    const width = isVertical ? 400 : 800;
    const height = isVertical ? 600 : 200;
    const fontSize = isVertical ? 48 : 64;
    const textAnchor = 'middle';
    const x = width / 2;
    const y = height / 2 + fontSize / 3;

    const lines = brandName.split(' ');
    let textElement = '';

    if (isVertical && lines.length > 1) {
      const lineHeight = fontSize * 1.2;
      const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
      textElement = lines
        .map(
          (line, i) =>
            `<text x="${x}" y="${startY + i * lineHeight}" font-family="${getFontFamily()}" font-size="${fontSize}" font-weight="${getFontWeight()}" letter-spacing="${getLetterSpacing()}" fill="${primaryColor}" text-anchor="${textAnchor}">${line}</text>`
        )
        .join('');
    } else {
      textElement = `<text x="${x}" y="${y}" font-family="${getFontFamily()}" font-size="${fontSize}" font-weight="${getFontWeight()}" letter-spacing="${getLetterSpacing()}" fill="${primaryColor}" text-anchor="${textAnchor}">${brandName}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${textElement}
</svg>`;
  }

  private static createIconLogo(request: LogoGenerationRequest): string {
    const { brandName, primaryColor } = request;
    const initials = brandName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="90" fill="${primaryColor}" />
  <text x="100" y="100" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
</svg>`;
  }

  static async generateAILogo(request: LogoGenerationRequest): Promise<string | null> {
    if (request.aiProvider !== 'openai') {
      console.warn('AI logo generation only supported with OpenAI currently');
      return null;
    }

    try {
      const client = AIClientManager.getOpenAIClient();

      const prompt = `Create a professional ${request.style} logo for a fictional news organization called "${request.brandName}". The logo should be clean, recognizable, and suitable for a news brand. Use a ${request.style} design aesthetic.`;

      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      return imageUrl;
    } catch (error) {
      console.error('Error generating AI logo:', error);
      return null;
    }
  }
}
