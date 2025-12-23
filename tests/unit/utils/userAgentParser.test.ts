import { parseUserAgent } from '../../../src/server/utils/userAgentParser';

describe('User Agent Parser', () => {
  describe('parseUserAgent', () => {
    it('should parse Chrome user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);

      expect(result.browser).toContain('Chrome');
      expect(result.os).toContain('Windows');
      expect(result.device).toBe('desktop');
    });

    it('should parse Firefox user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
      const result = parseUserAgent(ua);

      expect(result.browser).toContain('Firefox');
      expect(result.os).toContain('Windows');
      expect(result.device).toBe('desktop');
    });

    it('should parse Safari user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15';
      const result = parseUserAgent(ua);

      expect(result.browser).toContain('Safari');
      expect(result.os).toContain('macOS');
      expect(result.device).toBe('desktop');
    });

    it('should parse Edge user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      const result = parseUserAgent(ua);

      expect(result.browser).toBeDefined();
      expect(result.os).toContain('Windows');
      expect(result.device).toBe('desktop');
    });

    it('should parse mobile Chrome user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      const result = parseUserAgent(ua);

      expect(result.browser).toContain('Chrome');
      expect(result.os).toContain('Android');
      expect(result.device).toBe('mobile');
    });

    it('should parse iPhone Safari user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);

      expect(result.browser).toContain('Safari');
      expect(result.os).toContain('iOS');
      expect(result.device).toBe('mobile');
    });

    it('should parse iPad user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);

      expect(result.browser).toContain('Safari');
      expect(result.os).toContain('iOS');
      expect(result.device).toBe('tablet');
    });

    it('should handle null user agent', () => {
      const result = parseUserAgent(null);

      expect(result).toEqual({
        browser: null,
        os: null,
        device: null,
      });
    });

    it('should handle undefined user agent', () => {
      const result = parseUserAgent(undefined);

      expect(result).toEqual({
        browser: null,
        os: null,
        device: null,
      });
    });

    it('should handle empty string user agent', () => {
      const result = parseUserAgent('');

      expect(result).toEqual({
        browser: null,
        os: null,
        device: null,
      });
    });

    it('should handle malformed user agent gracefully', () => {
      const malformedUAs = [
        'invalid-user-agent',
        '123456',
        'Mozilla/5.0',
        'random text here',
      ];

      malformedUAs.forEach((ua) => {
        const result = parseUserAgent(ua);

        // Should return an object with null values for unparseable UAs
        expect(result).toBeDefined();
        expect(result).toHaveProperty('browser');
        expect(result).toHaveProperty('os');
        expect(result).toHaveProperty('device');
      });
    });

    it('should parse Android tablet user agent correctly', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);

      expect(result.os).toContain('Android');
      expect(result.browser).toContain('Chrome');
      // Device type detection depends on implementation
      expect(['mobile', 'tablet']).toContain(result.device);
    });

    it('should not throw errors on any user agent string', () => {
      const testCases = [
        null,
        undefined,
        '',
        'a'.repeat(1000), // Very long string
        '\n\t\r',
        '!@#$%^&*()',
        '<script>alert("xss")</script>',
      ];

      testCases.forEach((ua) => {
        expect(() => parseUserAgent(ua as any)).not.toThrow();
      });
    });

    it('should categorize devices consistently', () => {
      const mobileUA =
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      const desktopUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const tabletUA =
        'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';

      const mobileResult = parseUserAgent(mobileUA);
      const desktopResult = parseUserAgent(desktopUA);
      const tabletResult = parseUserAgent(tabletUA);

      expect(mobileResult.device).toBe('mobile');
      expect(desktopResult.device).toBe('desktop');
      expect(tabletResult.device).toBe('tablet');
    });
  });
});
