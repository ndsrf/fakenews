import { TemplateScraperService, LayoutMetadata } from '../../../src/server/services/templateScraperService';
import puppeteer, { Browser, Page } from 'puppeteer';

jest.mock('puppeteer');

describe('TemplateScraperService', () => {
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;

  beforeEach(() => {
    // Create mock page with all necessary methods
    mockPage = {
      setViewport: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn(),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Create mock browser
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock puppeteer.launch
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);
  });

  afterEach(async () => {
    await TemplateScraperService.closeBrowser();
    jest.clearAllMocks();
  });

  describe('extractTemplate', () => {
    it('should extract template from URL successfully', async () => {
      const mockCSSRules = [
        'body { font-family: Arial; }',
        'article { padding: 20px; }',
        'h1 { font-size: 2rem; }',
      ];

      const mockHTMLStructure = '<main class="content">\n  <article>\n    <!-- article content -->\n  </article>\n</main>';

      const mockMetadata: LayoutMetadata = {
        columns: 1,
        gridSystem: 'flexbox',
        typography: {
          fonts: ['Arial, sans-serif'],
          headingSizes: ['2.5rem', '2rem', '1.5rem'],
          bodySize: '16px',
        },
        colorScheme: {
          background: '#ffffff',
          text: '#000000',
          links: '#0000ff',
          borders: '#cccccc',
        },
        responsive: {
          breakpoints: ['(max-width: 768px)'],
        },
      };

      // Mock the evaluate calls in order
      mockPage.evaluate
        .mockResolvedValueOnce(undefined) // Remove scripts
        .mockResolvedValueOnce(mockCSSRules) // extractCSS
        .mockResolvedValueOnce(mockHTMLStructure) // extractHTMLStructure
        .mockResolvedValueOnce(mockMetadata) // extractLayoutMetadata
        .mockResolvedValueOnce(false); // detectSidebar

      const result = await TemplateScraperService.extractTemplate('https://example.com');

      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      expect(mockPage.setViewport).toHaveBeenCalledWith({ width: 1920, height: 1080 });
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
      expect(mockPage.screenshot).toHaveBeenCalledWith({
        type: 'png',
        fullPage: false,
      });

      expect(result).toMatchObject({
        cssStyles: expect.any(String),
        htmlStructure: mockHTMLStructure,
        hasSidebar: false,
        layoutMetadata: mockMetadata,
        previewImage: expect.stringContaining('data:image/png;base64,'),
      });

      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should detect sidebar when present', async () => {
      mockPage.evaluate
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce('<main></main>')
        .mockResolvedValueOnce({
          columns: 2,
          gridSystem: 'grid',
          typography: { fonts: [], headingSizes: [], bodySize: '16px' },
          colorScheme: { background: '#fff', text: '#000', links: '#00f', borders: '#ccc' },
          responsive: { breakpoints: [] },
        })
        .mockResolvedValueOnce(true); // hasSidebar = true

      const result = await TemplateScraperService.extractTemplate('https://example.com');

      expect(result.hasSidebar).toBe(true);
    });

    it('should close page even if extraction fails', async () => {
      mockPage.evaluate.mockRejectedValueOnce(new Error('Navigation failed'));

      await expect(TemplateScraperService.extractTemplate('https://example.com')).rejects.toThrow();

      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should reuse existing browser instance', async () => {
      mockPage.evaluate
        .mockResolvedValue(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce('<main></main>')
        .mockResolvedValueOnce({
          columns: 1,
          gridSystem: 'unknown',
          typography: { fonts: [], headingSizes: [], bodySize: '16px' },
          colorScheme: { background: '#fff', text: '#000', links: '#00f', borders: '#ccc' },
          responsive: { breakpoints: [] },
        })
        .mockResolvedValueOnce(false);

      await TemplateScraperService.extractTemplate('https://example.com');

      // Clear the mock counts
      (puppeteer.launch as jest.Mock).mockClear();

      // Second call should reuse browser
      mockPage.evaluate
        .mockResolvedValue(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce('<main></main>')
        .mockResolvedValueOnce({
          columns: 1,
          gridSystem: 'unknown',
          typography: { fonts: [], headingSizes: [], bodySize: '16px' },
          colorScheme: { background: '#fff', text: '#000', links: '#00f', borders: '#ccc' },
          responsive: { breakpoints: [] },
        })
        .mockResolvedValueOnce(false);

      await TemplateScraperService.extractTemplate('https://example.com');

      expect(puppeteer.launch).not.toHaveBeenCalled();
    });
  });

  describe('closeBrowser', () => {
    it('should close browser if it exists', async () => {
      // Trigger browser creation
      mockPage.evaluate
        .mockResolvedValue(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce('<main></main>')
        .mockResolvedValueOnce({
          columns: 1,
          gridSystem: 'unknown',
          typography: { fonts: [], headingSizes: [], bodySize: '16px' },
          colorScheme: { background: '#fff', text: '#000', links: '#00f', borders: '#ccc' },
          responsive: { breakpoints: [] },
        })
        .mockResolvedValueOnce(false);

      await TemplateScraperService.extractTemplate('https://example.com');

      await TemplateScraperService.closeBrowser();

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should do nothing if browser does not exist', async () => {
      await TemplateScraperService.closeBrowser();

      expect(mockBrowser.close).not.toHaveBeenCalled();
    });
  });

  describe('generateTemplateCSS', () => {
    it('should generate CSS from metadata with all properties', () => {
      const metadata: LayoutMetadata = {
        columns: 2,
        gridSystem: 'grid',
        typography: {
          fonts: ['Roboto, sans-serif', 'Arial'],
          headingSizes: ['3rem', '2rem', '1.5rem'],
          bodySize: '18px',
        },
        colorScheme: {
          background: '#f5f5f5',
          text: '#333333',
          links: '#0066cc',
          borders: '#dddddd',
        },
        responsive: {
          breakpoints: ['(max-width: 768px)', '(max-width: 480px)'],
        },
      };

      const css = TemplateScraperService.generateTemplateCSS(metadata);

      expect(css).toContain('font-family: Roboto, sans-serif');
      expect(css).toContain('font-size: 18px');
      expect(css).toContain('color: #333333');
      expect(css).toContain('background-color: #f5f5f5');
      expect(css).toContain('display: grid;');
      expect(css).toContain('grid-template-columns: repeat(2, 1fr);');
      expect(css).toContain('font-size: 3rem');
      expect(css).toContain('font-size: 2rem');
      expect(css).toContain('font-size: 1.5rem');
      expect(css).toContain('color: #0066cc');
      expect(css).toContain('@media (max-width: 768px)');
    });

    it('should generate CSS with flexbox layout', () => {
      const metadata: LayoutMetadata = {
        columns: 1,
        gridSystem: 'flexbox',
        typography: {
          fonts: ['Arial, sans-serif'],
          headingSizes: ['2.5rem'],
          bodySize: '16px',
        },
        colorScheme: {
          background: '#ffffff',
          text: '#000000',
          links: '#0000ff',
          borders: '#cccccc',
        },
        responsive: {
          breakpoints: [],
        },
      };

      const css = TemplateScraperService.generateTemplateCSS(metadata);

      expect(css).toContain('display: flex;');
      expect(css).not.toContain('display: grid;');
      expect(css).not.toContain('grid-template-columns');
    });

    it('should generate CSS without grid system', () => {
      const metadata: LayoutMetadata = {
        columns: 1,
        gridSystem: 'float',
        typography: {
          fonts: [],
          headingSizes: [],
          bodySize: '16px',
        },
        colorScheme: {
          background: '#ffffff',
          text: '#000000',
          links: '#0000ff',
          borders: '#cccccc',
        },
        responsive: {
          breakpoints: [],
        },
      };

      const css = TemplateScraperService.generateTemplateCSS(metadata);

      expect(css).not.toContain('display: grid;');
      expect(css).not.toContain('display: flex;');
    });

    it('should use default fonts when none provided', () => {
      const metadata: LayoutMetadata = {
        columns: 1,
        gridSystem: 'unknown',
        typography: {
          fonts: [],
          headingSizes: [],
          bodySize: '16px',
        },
        colorScheme: {
          background: '#ffffff',
          text: '#000000',
          links: '#0000ff',
          borders: '#cccccc',
        },
        responsive: {
          breakpoints: [],
        },
      };

      const css = TemplateScraperService.generateTemplateCSS(metadata);

      expect(css).toContain('font-family: Arial, sans-serif');
      expect(css).toContain('font-size: 2.5rem'); // default h1
      expect(css).toContain('font-size: 2rem'); // default h2
      expect(css).toContain('font-size: 1.5rem'); // default h3
    });

    it('should not include media query if no breakpoints', () => {
      const metadata: LayoutMetadata = {
        columns: 1,
        gridSystem: 'unknown',
        typography: {
          fonts: ['Arial'],
          headingSizes: [],
          bodySize: '16px',
        },
        colorScheme: {
          background: '#fff',
          text: '#000',
          links: '#00f',
          borders: '#ccc',
        },
        responsive: {
          breakpoints: [],
        },
      };

      const css = TemplateScraperService.generateTemplateCSS(metadata);

      expect(css).not.toContain('@media');
    });
  });
});
