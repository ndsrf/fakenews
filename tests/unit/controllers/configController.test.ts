import { Request, Response } from 'express';
import { ConfigController } from '../../../src/server/controllers/configController';
import { db } from '../../../src/server/config/database';

jest.mock('../../../src/server/config/database', () => ({
  db: {
    systemConfig: {
      findMany: jest.fn(),
    },
  },
}));

describe('ConfigController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { json, status };
    req = {} as any;

    jest.clearAllMocks();
  });

  describe('getDisclaimers', () => {
    it('should return disclaimer configuration', async () => {
      const mockDisclaimers = [
        { key: 'disclaimer_banner_en', value: 'English banner' },
        { key: 'disclaimer_banner_es', value: 'Spanish banner' },
        { key: 'disclaimer_footer_en', value: 'English footer' },
        { key: 'disclaimer_footer_es', value: 'Spanish footer' },
      ];

      (db.systemConfig.findMany as jest.Mock).mockResolvedValue(mockDisclaimers);

      await ConfigController.getDisclaimers(req as Request, res as Response);

      expect(db.systemConfig.findMany).toHaveBeenCalledWith({
        where: {
          key: {
            startsWith: 'disclaimer_',
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        banner: {
          en: 'English banner',
          es: 'Spanish banner',
        },
        footer: {
          en: 'English footer',
          es: 'Spanish footer',
        },
      });
    });

    it('should return empty config when no disclaimers found', async () => {
      (db.systemConfig.findMany as jest.Mock).mockResolvedValue([]);

      await ConfigController.getDisclaimers(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        banner: {
          en: '',
          es: '',
        },
        footer: {
          en: '',
          es: '',
        },
      });
    });

    it('should handle partial disclaimer data', async () => {
      const mockDisclaimers = [
        { key: 'disclaimer_banner_en', value: 'English banner' },
        { key: 'disclaimer_footer_es', value: 'Spanish footer' },
      ];

      (db.systemConfig.findMany as jest.Mock).mockResolvedValue(mockDisclaimers);

      await ConfigController.getDisclaimers(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        banner: {
          en: 'English banner',
          es: '',
        },
        footer: {
          en: '',
          es: 'Spanish footer',
        },
      });
    });

    it('should handle database errors', async () => {
      (db.systemConfig.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await ConfigController.getDisclaimers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should ignore unknown disclaimer keys', async () => {
      const mockDisclaimers = [
        { key: 'disclaimer_banner_en', value: 'English banner' },
        { key: 'disclaimer_unknown_key', value: 'Unknown value' },
        { key: 'other_config', value: 'Other' },
      ];

      (db.systemConfig.findMany as jest.Mock).mockResolvedValue(mockDisclaimers);

      await ConfigController.getDisclaimers(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        banner: {
          en: 'English banner',
          es: '',
        },
        footer: {
          en: '',
          es: '',
        },
      });
    });
  });
});
