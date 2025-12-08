import puppeteer, { Browser, Page } from 'puppeteer';

export interface ExtractedTemplate {
  cssStyles: string;
  htmlStructure: string;
  hasSidebar: boolean;
  layoutMetadata: LayoutMetadata;
  previewImage?: string;
}

export interface LayoutMetadata {
  columns: number;
  gridSystem: 'flexbox' | 'grid' | 'float' | 'unknown';
  typography: {
    fonts: string[];
    headingSizes: string[];
    bodySize: string;
  };
  colorScheme: {
    background: string;
    text: string;
    links: string;
    borders: string;
  };
  responsive: {
    breakpoints: string[];
  };
}

export class TemplateScraperService {
  private static browser: Browser | null = null;

  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  static async extractTemplate(url: string): Promise<ExtractedTemplate> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        scripts.forEach((script) => script.remove());
      });

      const cssStyles = await this.extractCSS(page);
      const htmlStructure = await this.extractHTMLStructure(page);
      const layoutMetadata = await this.extractLayoutMetadata(page);
      const hasSidebar = await this.detectSidebar(page);

      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
      });
      const previewImage = `data:image/png;base64,${Buffer.from(screenshotBuffer).toString('base64')}`;

      return {
        cssStyles,
        htmlStructure,
        hasSidebar,
        layoutMetadata,
        previewImage,
      };
    } finally {
      await page.close();
    }
  }

  private static async extractCSS(page: Page): Promise<string> {
    const cssRules = await page.evaluate(() => {
      const rules: string[] = [];
      const sheets = Array.from(document.styleSheets);

      for (const sheet of sheets) {
        try {
          if (sheet.cssRules) {
            const cssRulesArray = Array.from(sheet.cssRules);
            for (const rule of cssRulesArray) {
              rules.push(rule.cssText);
            }
          }
        } catch (e) {
          continue;
        }
      }

      return rules;
    });

    const relevantRules = cssRules.filter((rule) => {
      return (
        rule.includes('article') ||
        rule.includes('main') ||
        rule.includes('content') ||
        rule.includes('container') ||
        rule.includes('layout') ||
        rule.includes('grid') ||
        rule.includes('sidebar') ||
        rule.includes('header') ||
        rule.includes('h1') ||
        rule.includes('h2') ||
        rule.includes('h3') ||
        rule.includes('p {') ||
        rule.includes('body') ||
        rule.includes('@media')
      );
    });

    return relevantRules.join('\n\n');
  }

  private static async extractHTMLStructure(page: Page): Promise<string> {
    const structure = await page.evaluate(() => {
      const getStructure = (element: Element, depth: number = 0): string => {
        if (depth > 5) return '';

        const tag = element.tagName.toLowerCase();
        const classes = element.className
          ? ` class="${element.className}"`
          : '';
        const id = element.id ? ` id="${element.id}"` : '';

        const indent = '  '.repeat(depth);
        let html = `${indent}<${tag}${id}${classes}>`;

        if (
          tag === 'article' ||
          tag === 'main' ||
          tag === 'section' ||
          element.classList.contains('content') ||
          element.classList.contains('article')
        ) {
          const children = Array.from(element.children);
          if (children.length > 0) {
            html += '\n';
            children.forEach((child) => {
              html += getStructure(child, depth + 1);
            });
            html += `${indent}`;
          }
        } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'p') {
          html += `<!-- ${tag} content -->`;
        }

        html += `</${tag}>\n`;
        return html;
      };

      const article =
        document.querySelector('article') ||
        document.querySelector('main') ||
        document.querySelector('[role="main"]') ||
        document.querySelector('.content') ||
        document.querySelector('.article');

      if (article) {
        return getStructure(article);
      }

      return '<main class="content">\n  <article>\n    <!-- article content -->\n  </article>\n</main>';
    });

    return structure;
  }

  private static async extractLayoutMetadata(page: Page): Promise<LayoutMetadata> {
    const metadata = await page.evaluate(() => {
      const getComputedStyles = (selector: string) => {
        const element = document.querySelector(selector);
        return element ? window.getComputedStyle(element) : null;
      };

      const detectGridSystem = (): 'flexbox' | 'grid' | 'float' | 'unknown' => {
        const main = document.querySelector('main, article, .content');
        if (!main) return 'unknown';

        const styles = window.getComputedStyle(main);
        if (styles.display === 'grid') return 'grid';
        if (styles.display === 'flex') return 'flexbox';
        if (styles.float !== 'none') return 'float';

        return 'unknown';
      };

      const extractFonts = (): string[] => {
        const fonts = new Set<string>();
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, body');
        elements.forEach((el) => {
          const fontFamily = window.getComputedStyle(el).fontFamily;
          fonts.add(fontFamily);
        });
        return Array.from(fonts);
      };

      const extractHeadingSizes = (): string[] => {
        const sizes: string[] = [];
        ['h1', 'h2', 'h3'].forEach((tag) => {
          const element = document.querySelector(tag);
          if (element) {
            const fontSize = window.getComputedStyle(element).fontSize;
            sizes.push(fontSize);
          }
        });
        return sizes;
      };

      const extractColors = () => {
        const body = document.body;
        const bodyStyles = window.getComputedStyle(body);
        const link = document.querySelector('a');
        const linkStyles = link ? window.getComputedStyle(link) : null;

        return {
          background: bodyStyles.backgroundColor,
          text: bodyStyles.color,
          links: linkStyles ? linkStyles.color : '#0000ff',
          borders: bodyStyles.borderColor || '#cccccc',
        };
      };

      const extractBreakpoints = (): string[] => {
        const breakpoints: string[] = [];
        const sheets = Array.from(document.styleSheets);

        for (const sheet of sheets) {
          try {
            if (sheet.cssRules) {
              const rules = Array.from(sheet.cssRules);
              rules.forEach((rule) => {
                if (rule.type === CSSRule.MEDIA_RULE) {
                  const mediaRule = rule as CSSMediaRule;
                  breakpoints.push(mediaRule.conditionText || mediaRule.media.mediaText);
                }
              });
            }
          } catch (e) {
            continue;
          }
        }

        return Array.from(new Set(breakpoints));
      };

      const countColumns = (): number => {
        const main = document.querySelector('main, article, .content');
        if (!main) return 1;

        const children = Array.from(main.children);
        if (children.length === 0) return 1;

        const firstChild = children[0];
        const styles = window.getComputedStyle(firstChild);

        if (styles.display === 'grid') {
          const cols = styles.gridTemplateColumns;
          return cols.split(' ').length;
        }

        const widths = children.map((child) => {
          const rect = child.getBoundingClientRect();
          return rect.width;
        });

        const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
        const containerWidth = main.getBoundingClientRect().width;

        return Math.round(containerWidth / avgWidth);
      };

      const bodyStyles = getComputedStyles('body');

      return {
        columns: countColumns(),
        gridSystem: detectGridSystem(),
        typography: {
          fonts: extractFonts(),
          headingSizes: extractHeadingSizes(),
          bodySize: bodyStyles ? bodyStyles.fontSize : '16px',
        },
        colorScheme: extractColors(),
        responsive: {
          breakpoints: extractBreakpoints(),
        },
      };
    });

    return metadata;
  }

  private static async detectSidebar(page: Page): Promise<boolean> {
    const hasSidebar = await page.evaluate(() => {
      const sidebarSelectors = [
        'aside',
        '.sidebar',
        '[role="complementary"]',
        '.side-column',
        '.widget-area',
      ];

      for (const selector of sidebarSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 100) {
            return true;
          }
        }
      }

      return false;
    });

    return hasSidebar;
  }

  static generateTemplateCSS(metadata: LayoutMetadata): string {
    const css = `
/* Base Styles */
body {
  font-family: ${metadata.typography.fonts[0] || 'Arial, sans-serif'};
  font-size: ${metadata.typography.bodySize};
  color: ${metadata.colorScheme.text};
  background-color: ${metadata.colorScheme.background};
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

/* Layout Container */
.article-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  ${metadata.gridSystem === 'grid' ? 'display: grid;' : ''}
  ${metadata.gridSystem === 'flexbox' ? 'display: flex;' : ''}
  ${metadata.columns > 1 ? `grid-template-columns: repeat(${metadata.columns}, 1fr);` : ''}
  gap: 30px;
}

/* Article Content */
.article-content {
  flex: 1;
}

/* Typography */
h1 {
  font-size: ${metadata.typography.headingSizes[0] || '2.5rem'};
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

h2 {
  font-size: ${metadata.typography.headingSizes[1] || '2rem'};
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: ${metadata.typography.headingSizes[2] || '1.5rem'};
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

p {
  margin-bottom: 1rem;
}

a {
  color: ${metadata.colorScheme.links};
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Sidebar */
.sidebar {
  width: 300px;
  flex-shrink: 0;
}

/* Responsive */
${metadata.responsive.breakpoints[0] ? `@media ${metadata.responsive.breakpoints[0]} {
  .article-container {
    grid-template-columns: 1fr;
  }
  .sidebar {
    width: 100%;
  }
}` : ''}
`;

    return css.trim();
  }
}
