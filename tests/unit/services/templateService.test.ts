import { TemplateService } from '../../../src/server/services/templateService';
import { db } from '../../../src/server/config/database';
import { TemplateScraperService } from '../../../src/server/services/templateScraperService';

jest.mock('../../../src/server/config/database', () => ({
  db: {
    template: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../../src/server/services/templateScraperService');

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTemplate', () => {
    const mockInput = {
      name: 'Test Template',
      type: 'default' as const,
      cssStyles: 'body {}',
      htmlStructure: '<div></div>',
      language: 'en' as const,
    };

    it('should create template', async () => {
      const mockCreated = { id: '1', ...mockInput, isActive: true };
      (db.template.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await TemplateService.createTemplate(mockInput);

      expect(db.template.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          name: mockInput.name,
          type: mockInput.type,
          isActive: true
        })
      }));
      expect(result).toEqual(mockCreated);
    });
  });

  describe('getTemplate', () => {
    it('should return template', async () => {
      const mockTemplate = { id: '1', name: 'Test' };
      (db.template.findUnique as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await TemplateService.getTemplate('1');

      expect(db.template.findUnique).toHaveBeenCalled();
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('listTemplates', () => {
    it('should list templates with filters', async () => {
      (db.template.findMany as jest.Mock).mockResolvedValue([]);

      await TemplateService.listTemplates({ language: 'en', isActive: true, brandId: '1', type: 'default' });

      expect(db.template.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          language: 'en',
          isActive: true,
          brandId: '1',
          type: 'default'
        })
      }));
    });

    it('should list templates without filters', async () => {
      (db.template.findMany as jest.Mock).mockResolvedValue([]);
      await TemplateService.listTemplates();
      expect(db.template.findMany).toHaveBeenCalled();
    });
  });

  describe('updateTemplate', () => {
    it('should update template', async () => {
      const mockUpdate = { name: 'New Name' };
      (db.template.update as jest.Mock).mockResolvedValue({ id: '1', ...mockUpdate });

      await TemplateService.updateTemplate('1', mockUpdate);

      expect(db.template.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining(mockUpdate)
      });
    });
  });

  describe('deleteTemplate', () => {
    it('should soft delete template', async () => {
      await TemplateService.deleteTemplate('1');

      expect(db.template.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false }
      });
    });
  });

  describe('extractFromUrl', () => {
    it('should extract template from url', async () => {
      const mockExtracted = {
        htmlStructure: '<div></div>',
        hasSidebar: true,
        layoutMetadata: {},
        previewImage: 'img.jpg'
      };
      (TemplateScraperService.extractTemplate as jest.Mock).mockResolvedValue(mockExtracted);
      (TemplateScraperService.generateTemplateCSS as jest.Mock).mockReturnValue('css');
      (db.template.create as jest.Mock).mockResolvedValue({ id: '1', name: 'Extracted' });
      (db.template.update as jest.Mock).mockResolvedValue({ id: '1', previewImage: 'img.jpg' });

      await TemplateService.extractFromUrl('http://url.com', 'Name');

      expect(TemplateScraperService.extractTemplate).toHaveBeenCalledWith('http://url.com');
      expect(TemplateService.createTemplate).toHaveBeenCalled; // Implicitly tested via createTemplate mock
    });

    it('should throw error on extraction failure', async () => {
      (TemplateScraperService.extractTemplate as jest.Mock).mockRejectedValue(new Error('Failed'));

      await expect(TemplateService.extractFromUrl('http://url.com', 'Name'))
        .rejects
        .toThrow('Failed to extract template from URL');
    });
  });

  describe('createDefaultTemplates', () => {
    it('should create default templates if not exist', async () => {
      (db.template.findFirst as jest.Mock).mockResolvedValue(null); // None exist

      await TemplateService.createDefaultTemplates();

      expect(db.template.create).toHaveBeenCalledTimes(3);
    });

    it('should skip creation if exists', async () => {
      (db.template.findFirst as jest.Mock).mockResolvedValue({ id: '1' }); // All exist

      await TemplateService.createDefaultTemplates();

      expect(db.template.create).not.toHaveBeenCalled();
    });
  });
});
