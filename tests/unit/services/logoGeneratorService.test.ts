import { LogoGeneratorService, LogoGenerationRequest } from '../../../src/server/services/logoGeneratorService';
import { AIClientManager } from '../../../src/server/config/ai';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

jest.mock('../../../src/server/config/ai');
jest.mock('fs/promises');
jest.mock('sharp');

describe('LogoGeneratorService', () => {
  const mockRequest: LogoGenerationRequest = {
    brandName: 'Test Brand',
    style: 'modern',
    primaryColor: '#000000',
    accentColor: '#ffffff',
    aiProvider: 'openai',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    
    // Mock Sharp
    const mockSharpInstance = {
      resize: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue({}),
    };
    (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);
  });

  describe('generateLogo', () => {
    it('should generate logo variations', async () => {
      const result = await LogoGeneratorService.generateLogo(mockRequest);

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledTimes(4); // 4 variations
      expect(sharp).toHaveBeenCalledTimes(4);
      expect(result.variations.horizontal).toContain('/uploads/brands/');
      expect(result.metadata.style).toBe('modern');
    });

    it('should handle different styles', async () => {
      const styles = ['classic', 'minimalist', 'vintage', 'tech', 'editorial'] as const;
      
      for (const style of styles) {
        await LogoGeneratorService.generateLogo({ ...mockRequest, style });
      }
      // Assertions implicit - shouldn't throw
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('Write error'));

      await expect(LogoGeneratorService.generateLogo(mockRequest))
        .rejects
        .toThrow('Failed to generate logo');
    });
    
    it('should handle vertical logo with multiple words', async () => {
       await LogoGeneratorService.generateLogo({ ...mockRequest, brandName: 'Multi Word Brand' });
       expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('generateAILogo', () => {
    it('should generate AI logo using OpenAI', async () => {
      const mockOpenAIClient = {
        images: {
          generate: jest.fn().mockResolvedValue({
            data: [{ url: 'http://image.url' }]
          })
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await LogoGeneratorService.generateAILogo(mockRequest);

      expect(result).toBe('http://image.url');
      expect(mockOpenAIClient.images.generate).toHaveBeenCalledWith(expect.objectContaining({
        prompt: expect.stringContaining('modern')
      }));
    });

    it('should return null for non-OpenAI provider', async () => {
      const result = await LogoGeneratorService.generateAILogo({ ...mockRequest, aiProvider: 'anthropic' });
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const mockOpenAIClient = {
        images: {
          generate: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await LogoGeneratorService.generateAILogo(mockRequest);
      expect(result).toBeNull();
    });
    
     it('should handle missing image URL in response', async () => {
      const mockOpenAIClient = {
        images: {
          generate: jest.fn().mockResolvedValue({
            data: []
          })
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await LogoGeneratorService.generateAILogo(mockRequest);
      expect(result).toBeNull();
    });
  });
});
