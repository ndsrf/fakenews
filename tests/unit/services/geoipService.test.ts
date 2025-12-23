import { geoipService } from '../../../src/server/services/geoipService';
import geoip from 'geoip-lite';

// Mock geoip-lite library
jest.mock('geoip-lite');

describe('GeoIPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.warn for tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('lookup', () => {
    it('should return country and city for valid IP', () => {
      const mockGeoData = {
        country: 'US',
        city: 'San Francisco',
        region: 'CA',
        timezone: 'America/Los_Angeles',
      };

      (geoip.lookup as jest.Mock).mockReturnValue(mockGeoData);

      const result = geoipService.lookup('8.8.8.8');

      expect(result).toEqual({
        country: 'US',
        city: 'San Francisco',
      });
      expect(geoip.lookup).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should return country when city is not available', () => {
      const mockGeoData = {
        country: 'GB',
        city: null,
        region: 'ENG',
        timezone: 'Europe/London',
      };

      (geoip.lookup as jest.Mock).mockReturnValue(mockGeoData);

      const result = geoipService.lookup('151.101.1.140');

      expect(result).toEqual({
        country: 'GB',
        city: null,
      });
    });

    it('should handle null IP gracefully', () => {
      const result = geoipService.lookup(null);

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(geoip.lookup).not.toHaveBeenCalled();
    });

    it('should handle undefined IP gracefully', () => {
      const result = geoipService.lookup(undefined);

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(geoip.lookup).not.toHaveBeenCalled();
    });

    it('should handle empty string IP gracefully', () => {
      const result = geoipService.lookup('');

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(geoip.lookup).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only IP gracefully', () => {
      const result = geoipService.lookup('   ');

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(geoip.lookup).not.toHaveBeenCalled();
    });

    it('should handle private IP addresses that return null from geoip', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      const result = geoipService.lookup('192.168.1.1');

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('GeoIP lookup failed'));
    });

    it('should handle invalid IP addresses that return null from geoip', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      const result = geoipService.lookup('invalid-ip');

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('GeoIP lookup failed'));
    });

    it('should handle localhost IP gracefully', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      const result = geoipService.lookup('127.0.0.1');

      expect(result).toEqual({
        country: null,
        city: null,
      });
    });

    it('should handle IPv6 addresses', () => {
      const mockGeoData = {
        country: 'US',
        city: 'Mountain View',
        region: 'CA',
        timezone: 'America/Los_Angeles',
      };

      (geoip.lookup as jest.Mock).mockReturnValue(mockGeoData);

      const result = geoipService.lookup('2001:4860:4860::8888');

      expect(result).toEqual({
        country: 'US',
        city: 'Mountain View',
      });
    });

    it('should handle errors from geoip library gracefully', () => {
      (geoip.lookup as jest.Mock).mockImplementation(() => {
        throw new Error('GeoIP library error');
      });

      const result = geoipService.lookup('8.8.8.8');

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(console.warn).toHaveBeenCalledWith('GeoIP lookup error:', 'GeoIP library error');
    });

    it('should handle non-Error exceptions gracefully', () => {
      (geoip.lookup as jest.Mock).mockImplementation(() => {
        throw 'String error';
      });

      const result = geoipService.lookup('8.8.8.8');

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(console.warn).toHaveBeenCalledWith('GeoIP lookup error:', 'Unknown error');
    });

    it('should handle non-string input types gracefully', () => {
      const result = geoipService.lookup(12345 as any);

      expect(result).toEqual({
        country: null,
        city: null,
      });
      expect(geoip.lookup).not.toHaveBeenCalled();
    });

    it('should log anonymized IP on lookup failure', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      geoipService.lookup('123.456.789.012');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('GeoIP lookup failed for IP (anonymized): 123.456...')
      );
    });

    it('should return null for city when geoip data has no city', () => {
      const mockGeoData = {
        country: 'FR',
        region: 'IDF',
        timezone: 'Europe/Paris',
      };

      (geoip.lookup as jest.Mock).mockReturnValue(mockGeoData);

      const result = geoipService.lookup('213.186.33.5');

      expect(result).toEqual({
        country: 'FR',
        city: null,
      });
    });

    it('should handle empty geoip data object', () => {
      (geoip.lookup as jest.Mock).mockReturnValue({});

      const result = geoipService.lookup('1.2.3.4');

      expect(result).toEqual({
        country: null,
        city: null,
      });
    });

    it('should consistently return same result for same IP', () => {
      const mockGeoData = {
        country: 'DE',
        city: 'Berlin',
        region: 'BE',
        timezone: 'Europe/Berlin',
      };

      (geoip.lookup as jest.Mock).mockReturnValue(mockGeoData);

      const result1 = geoipService.lookup('8.8.4.4');
      const result2 = geoipService.lookup('8.8.4.4');

      expect(result1).toEqual(result2);
      expect(result1).toEqual({
        country: 'DE',
        city: 'Berlin',
      });
    });

    it('should not throw on any input', () => {
      const testCases = [
        null,
        undefined,
        '',
        '   ',
        'invalid',
        '999.999.999.999',
        '::1',
        'fe80::1',
        '<script>alert("xss")</script>',
        'a'.repeat(1000),
      ];

      testCases.forEach((testCase) => {
        expect(() => geoipService.lookup(testCase as any)).not.toThrow();
      });
    });
  });
});
