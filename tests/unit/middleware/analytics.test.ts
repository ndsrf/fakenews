import { Request, Response, NextFunction } from 'express';
import { trackPageView } from '../../../src/server/middleware/analytics';
import { db } from '../../../src/server/config/database';
import { anonymizeIP } from '../../../src/server/utils/ipAnonymizer';
import { parseUserAgent } from '../../../src/server/utils/userAgentParser';
import { geoipService } from '../../../src/server/services/geoipService';
import logger from '../../../src/server/config/logger';

jest.mock('../../../src/server/config/database', () => ({
  db: {
    article: {
      findFirst: jest.fn(),
    },
    pageView: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../../src/server/utils/ipAnonymizer');
jest.mock('../../../src/server/utils/userAgentParser');
jest.mock('../../../src/server/services/geoipService');
jest.mock('../../../src/server/config/logger');

describe('Analytics Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let finishCallback: () => void;

  beforeEach(() => {
    next = jest.fn();
    finishCallback = jest.fn();

    res = {
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
        return res as any;
      }),
    } as Partial<Response>;

    req = {
      params: {},
      headers: {},
      ip: '192.168.1.1',
      socket: { remoteAddress: '192.168.1.1' },
      path: '/article/test-slug',
    } as any;

    jest.clearAllMocks();
  });

  it('should call next immediately', () => {
    trackPageView(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should track page view when article is found', async () => {
    req.params = { slug: 'test-article' };
    req.headers = { 'user-agent': 'Mozilla/5.0' };

    const mockArticle = { id: 'article-1', slug: 'test-article', status: 'published' };
    (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);
    (anonymizeIP as jest.Mock).mockReturnValue('anonymized-ip');
    (parseUserAgent as jest.Mock).mockReturnValue({
      browser: 'Chrome',
      os: 'Windows',
      device: 'desktop',
    });
    (geoipService.lookup as jest.Mock).mockReturnValue({
      country: 'US',
      city: 'New York',
    });

    trackPageView(req as Request, res as Response, next);
    await finishCallback();

    // Give async operations time to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.article.findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'test-article',
        status: 'published',
      },
    });

    expect(db.pageView.create).toHaveBeenCalledWith({
      data: {
        articleId: 'article-1',
        ipAddress: 'anonymized-ip',
        country: 'US',
        city: 'New York',
        browser: 'Chrome',
        os: 'Windows',
        device: 'desktop',
        referrer: null,
      },
    });
  });

  it('should handle referrer header', async () => {
    req.params = { slug: 'test-article' };
    req.headers = {
      'user-agent': 'Mozilla/5.0',
      referer: 'https://google.com',
    };

    const mockArticle = { id: 'article-1', slug: 'test-article', status: 'published' };
    (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);
    (anonymizeIP as jest.Mock).mockReturnValue('anonymized-ip');
    (parseUserAgent as jest.Mock).mockReturnValue({
      browser: 'Chrome',
      os: 'Windows',
      device: 'desktop',
    });
    (geoipService.lookup as jest.Mock).mockReturnValue({
      country: 'US',
      city: 'New York',
    });

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.pageView.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        referrer: 'https://google.com',
      }),
    });
  });

  it('should skip tracking when no article slug', async () => {
    req.params = {};

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.article.findFirst).not.toHaveBeenCalled();
    expect(db.pageView.create).not.toHaveBeenCalled();
  });

  it('should skip tracking when article not found', async () => {
    req.params = { slug: 'non-existent' };
    (db.article.findFirst as jest.Mock).mockResolvedValue(null);

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.pageView.create).not.toHaveBeenCalled();
  });

  it('should skip tracking when article not published', async () => {
    req.params = { slug: 'draft-article' };
    (db.article.findFirst as jest.Mock).mockResolvedValue(null);

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.pageView.create).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    req.params = { slug: 'test-article' };
    (db.article.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(logger.error).toHaveBeenCalledWith('Page view tracking error', expect.any(Object));
    expect(db.pageView.create).not.toHaveBeenCalled();
  });

  it('should use unknown for IP when anonymization returns null', async () => {
    req.params = { slug: 'test-article' };

    const mockArticle = { id: 'article-1', slug: 'test-article', status: 'published' };
    (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);
    (anonymizeIP as jest.Mock).mockReturnValue(null);
    (parseUserAgent as jest.Mock).mockReturnValue({
      browser: 'Chrome',
      os: 'Windows',
      device: 'desktop',
    });
    (geoipService.lookup as jest.Mock).mockReturnValue({
      country: 'US',
      city: 'New York',
    });

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.pageView.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ipAddress: 'unknown',
      }),
    });
  });

  it('should handle array referrer headers', async () => {
    req.params = { slug: 'test-article' };
    req.headers = {
      'user-agent': 'Mozilla/5.0',
      referer: ['https://google.com', 'https://bing.com'] as any,
    };

    const mockArticle = { id: 'article-1', slug: 'test-article', status: 'published' };
    (db.article.findFirst as jest.Mock).mockResolvedValue(mockArticle);
    (anonymizeIP as jest.Mock).mockReturnValue('anonymized-ip');
    (parseUserAgent as jest.Mock).mockReturnValue({
      browser: 'Chrome',
      os: 'Windows',
      device: 'desktop',
    });
    (geoipService.lookup as jest.Mock).mockReturnValue({
      country: 'US',
      city: 'New York',
    });

    trackPageView(req as Request, res as Response, next);
    await finishCallback();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(db.pageView.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        referrer: 'https://google.com',
      }),
    });
  });
});
