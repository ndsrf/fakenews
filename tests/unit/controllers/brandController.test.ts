import { Request, Response } from 'express';
import { BrandController } from '../../../src/server/controllers/brandController';
import { BrandService } from '../../../src/server/services/brandService';
import { LogoGeneratorService } from '../../../src/server/services/logoGeneratorService';

jest.mock('../../../src/server/services/brandService');
jest.mock('../../../src/server/services/logoGeneratorService');

describe('BrandController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  const mockAdminUser = { id: 'admin-1', role: 'admin', email: 'admin@example.com' };
  const mockUser = { id: 'user-1', role: 'user', email: 'user@example.com' };

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { json, status };
    req = {
      body: {},
      params: {},
      query: {},
      user: mockAdminUser,
    } as any;

    jest.clearAllMocks();
  });

  describe('createBrand', () => {
    const validBody = {
      name: 'Brand',
      description: 'Desc',
      websiteUrl: 'http://example.com',
      categories: ['Tech'],
      language: 'en',
    };

    it('should create brand if authorized', async () => {
      req.body = validBody;
      (BrandService.createBrand as jest.Mock).mockResolvedValue({ id: '1', ...validBody });

      await BrandController.createBrand(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(BrandService.createBrand).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await BrandController.createBrand(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 400 for validation error', async () => {
      req.body = { ...validBody, name: '' };
      await BrandController.createBrand(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getBrand', () => {
    it('should return brand if found', async () => {
      req.params = { id: '1' };
      (BrandService.getBrand as jest.Mock).mockResolvedValue({ id: '1' });

      await BrandController.getBrand(req as Request, res as Response);

      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      req.params = { id: '1' };
      (BrandService.getBrand as jest.Mock).mockResolvedValue(null);

      await BrandController.getBrand(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('listBrands', () => {
    it('should list brands', async () => {
      req.query = { language: 'en', isActive: 'true' };
      (BrandService.listBrands as jest.Mock).mockResolvedValue([]);

      await BrandController.listBrands(req as Request, res as Response);

      expect(BrandService.listBrands).toHaveBeenCalledWith({ language: 'en', isActive: true });
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateBrand', () => {
    const updateBody = { name: 'New Name' };

    it('should update brand if authorized', async () => {
      req.params = { id: '1' };
      req.body = updateBody;
      (BrandService.updateBrand as jest.Mock).mockResolvedValue({ id: '1', ...updateBody });

      await BrandController.updateBrand(req as Request, res as Response);

      expect(BrandService.updateBrand).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await BrandController.updateBrand(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('deleteBrand', () => {
    it('should delete brand if authorized', async () => {
      req.params = { id: '1' };
      req.user = { role: 'super_admin' }; // Only super_admin

      await BrandController.deleteBrand(req as Request, res as Response);

      expect(BrandService.deleteBrand).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await BrandController.deleteBrand(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('generateLogo', () => {
    const validLogoBody = {
      brandName: 'Brand',
      style: 'modern',
      primaryColor: '#000000',
      aiProvider: 'openai',
      useAI: true,
    };

    it('should generate logo if authorized', async () => {
      req.body = validLogoBody;
      (LogoGeneratorService.generateAILogo as jest.Mock).mockResolvedValue('http://logo.url');
      (LogoGeneratorService.generateLogo as jest.Mock).mockResolvedValue({
        variations: [],
        metadata: {}
      });

      await BrandController.generateLogo(req as Request, res as Response);

      expect(LogoGeneratorService.generateAILogo).toHaveBeenCalled();
      expect(LogoGeneratorService.generateLogo).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        aiGenerated: 'http://logo.url'
      }));
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await BrandController.generateLogo(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
