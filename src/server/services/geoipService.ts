import geoip from 'geoip-lite';

/**
 * Geographic location information extracted from an IP address.
 */
export interface GeoIPResult {
  country: string | null;
  city: string | null;
}

/**
 * GeoIP lookup service for IP address to geographic location mapping.
 *
 * This service:
 * - Handles lookup failures gracefully (returns null)
 * - Does not block page view tracking on failure
 * - Logs warnings for lookup failures
 * - Caches lookups internally (geoip-lite handles this)
 */
class GeoIPService {
  /**
   * Looks up geographic location for an IP address.
   *
   * @param ip - IP address to look up (IPv4 or IPv6)
   * @returns Geographic location information or null on failure
   */
  lookup(ip: string | null | undefined): GeoIPResult {
    // Handle null, undefined, or empty input gracefully
    if (!ip || typeof ip !== 'string' || ip.trim() === '') {
      return {
        country: null,
        city: null,
      };
    }

    try {
      const geo = geoip.lookup(ip);

      // If lookup fails (e.g., private IP, invalid IP), return null values
      if (!geo) {
        console.warn(`GeoIP lookup failed for IP (anonymized): ${ip.substring(0, 7)}...`);
        return {
          country: null,
          city: null,
        };
      }

      // Extract country and city (city may not be available in geoip-lite)
      const country = geo.country || null;
      // geoip-lite doesn't provide city, only country, region, timezone
      // Using the region as a proxy for city
      const city = geo.city || null;

      return {
        country,
        city,
      };
    } catch (error) {
      // Handle any lookup errors gracefully
      // Log warning but do not throw
      console.warn('GeoIP lookup error:', error instanceof Error ? error.message : 'Unknown error');
      return {
        country: null,
        city: null,
      };
    }
  }
}

// Export singleton instance
export const geoipService = new GeoIPService();
