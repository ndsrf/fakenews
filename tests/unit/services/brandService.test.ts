import { BrandService } from '../../../src/server/services/brandService';
import { db } from '../../../src/server/config/database';

jest.mock('../../../src/server/config/database', () => ({
  db: {
    newsBrand: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('BrandService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBrand', () => {
    const mockInput = {
      name: 'Test Brand',
      description: 'Description',
      language: 'en' as const,
      websiteUrl: 'http://example.com',
      categories: ['Tech'],
      primaryColor: '#000000',
      accentColor: '#ffffff',
    };

    it('should create a brand with default values', async () => {
      const mockCreatedBrand = { id: '1', ...mockInput, isActive: true };
      (db.newsBrand.create as jest.Mock).mockResolvedValue(mockCreatedBrand);

      const result = await BrandService.createBrand(mockInput);

      expect(db.newsBrand.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: mockInput.name,
          primaryColor: '#000000',
          isActive: true,
        }),
      });
      expect(result).toEqual(mockCreatedBrand);
    });
  });

  describe('getBrand', () => {
    it('should return brand with relations', async () => {
      const mockBrand = { id: '1', name: 'Brand' };
      (db.newsBrand.findUnique as jest.Mock).mockResolvedValue(mockBrand);

      const result = await BrandService.getBrand('1');

      expect(db.newsBrand.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          include: expect.objectContaining({
            articles: expect.any(Object),
            templates: expect.any(Object),
          }),
        })
      );
      expect(result).toEqual(mockBrand);
    });
  });

  describe('listBrands', () => {
    it('should list brands with filters', async () => {
      (db.newsBrand.findMany as jest.Mock).mockResolvedValue([]);

      await BrandService.listBrands({ language: 'en', isActive: true });

      expect(db.newsBrand.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { language: 'en', isActive: true },
        })
      );
    });

    it('should list all brands if no filters provided', async () => {
      (db.newsBrand.findMany as jest.Mock).mockResolvedValue([]);

      await BrandService.listBrands();

      expect(db.newsBrand.findMany).toHaveBeenCalled();
    });
  });

  describe('updateBrand', () => {
    it('should update brand fields', async () => {
      const mockUpdate = { name: 'New Name', categories: ['New'] };
      (db.newsBrand.update as jest.Mock).mockResolvedValue({ id: '1', ...mockUpdate });

      await BrandService.updateBrand('1', mockUpdate);

      expect(db.newsBrand.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          name: 'New Name',
          categories: JSON.stringify(['New']),
        }),
      });
    });
  });

  describe('deleteBrand', () => {
    it('should soft delete brand', async () => {
      await BrandService.deleteBrand('1');

      expect(db.newsBrand.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
    });
  });

  describe('getBrandBySlug', () => {
    it('should find brand by generated slug', async () => {
      const brands = [
        { id: '1', name: 'Test Brand' },
        { id: '2', name: 'Other Brand' },
      ];
      (db.newsBrand.findMany as jest.Mock).mockResolvedValue(brands);

      const result = await BrandService.getBrandBySlug('test-brand');

      expect(result).toEqual(brands[0]);
    });

    it('should return null if not found', async () => {
      (db.newsBrand.findMany as jest.Mock).mockResolvedValue([]);

      const result = await BrandService.getBrandBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('slugify', () => {
    it('should slugify text correctly', () => {
      expect(BrandService.slugify('Test Brand Name!')).toBe('test-brand-name');
    });
  });
});
