import { Request, Response } from 'express';
import { TemplateController } from '../../../src/server/controllers/templateController';
import { TemplateService } from '../../../src/server/services/templateService';

jest.mock('../../../src/server/services/templateService');

describe('TemplateController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  const mockAdminUser = { id: 'admin-1', role: 'admin' };
  const mockUser = { id: 'user-1', role: 'user' };

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

  describe('createTemplate', () => {
    const validBody = {
      name: 'Template',
      type: 'default',
      cssStyles: 'css',
      htmlStructure: 'html',
      language: 'en'
    };

    it('should create template if authorized', async () => {
      req.body = validBody;
      (TemplateService.createTemplate as jest.Mock).mockResolvedValue({ id: '1', ...validBody });

      await TemplateController.createTemplate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(TemplateService.createTemplate).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await TemplateController.createTemplate(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 400 for validation error', async () => {
      req.body = { ...validBody, name: '' };
      await TemplateController.createTemplate(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getTemplate', () => {
    it('should return template if found', async () => {
      req.params = { id: '1' };
      (TemplateService.getTemplate as jest.Mock).mockResolvedValue({ id: '1' });

      await TemplateController.getTemplate(req as Request, res as Response);

      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      req.params = { id: '1' };
      (TemplateService.getTemplate as jest.Mock).mockResolvedValue(null);

      await TemplateController.getTemplate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('listTemplates', () => {
    it('should list templates', async () => {
      req.query = { type: 'default' };
      (TemplateService.listTemplates as jest.Mock).mockResolvedValue([]);

      await TemplateController.listTemplates(req as Request, res as Response);

      expect(TemplateService.listTemplates).toHaveBeenCalledWith(expect.objectContaining({ type: 'default' }));
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateTemplate', () => {
    it('should update template if authorized', async () => {
      req.params = { id: '1' };
      req.body = { name: 'New' };
      (TemplateService.updateTemplate as jest.Mock).mockResolvedValue({ id: '1' });

      await TemplateController.updateTemplate(req as Request, res as Response);

      expect(TemplateService.updateTemplate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await TemplateController.updateTemplate(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template if authorized', async () => {
      req.params = { id: '1' };
      req.user = { role: 'super_admin' };

      await TemplateController.deleteTemplate(req as Request, res as Response);

      expect(TemplateService.deleteTemplate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await TemplateController.deleteTemplate(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('extractTemplate', () => {
    const extractBody = { url: 'http://url.com', name: 'Extracted' };

    it('should extract template if authorized', async () => {
      req.body = extractBody;
      (TemplateService.extractFromUrl as jest.Mock).mockResolvedValue({ id: '1' });

      await TemplateController.extractTemplate(req as Request, res as Response);

      expect(TemplateService.extractFromUrl).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 403 if unauthorized', async () => {
      req.user = mockUser;
      await TemplateController.extractTemplate(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
