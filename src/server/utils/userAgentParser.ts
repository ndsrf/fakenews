import { UAParser } from 'ua-parser-js';

/**
 * Information extracted from a user agent string.
 */
export interface UserAgentInfo {
  browser: string | null;  // "Chrome 120.0"
  os: string | null;       // "Windows 10"
  device: 'desktop' | 'mobile' | 'tablet' | null;
}

/**
 * Parses user agent strings to extract browser, OS, and device type information.
 *
 * This function:
 * - Handles null/undefined/malformed user agents gracefully
 * - Returns null for unparseable values
 * - Does not throw errors on invalid input
 * - Provides consistent device categorization
 *
 * @param userAgent - The user agent string from HTTP headers
 * @returns Parsed user agent information or null values for unparseable fields
 */
export function parseUserAgent(userAgent: string | null | undefined): UserAgentInfo {
  // Handle null, undefined, or empty input gracefully
  if (!userAgent || typeof userAgent !== 'string' || userAgent.trim() === '') {
    return {
      browser: null,
      os: null,
      device: null,
    };
  }

  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Extract browser name and version
    let browser: string | null = null;
    if (result.browser.name) {
      browser = result.browser.name;
      if (result.browser.version) {
        browser += ` ${result.browser.version}`;
      }
    }

    // Extract OS name and version
    let os: string | null = null;
    if (result.os.name) {
      os = result.os.name;
      if (result.os.version) {
        os += ` ${result.os.version}`;
      }
    }

    // Determine device type
    let device: 'desktop' | 'mobile' | 'tablet' | null = null;
    if (result.device.type === 'mobile') {
      device = 'mobile';
    } else if (result.device.type === 'tablet') {
      device = 'tablet';
    } else if (result.device.type === 'wearable' || result.device.type === 'smarttv' || result.device.type === 'console') {
      // Categorize other device types as mobile for simplicity
      device = 'mobile';
    } else {
      // If no device type specified, assume desktop
      // (this is the case for most desktop browsers)
      device = 'desktop';
    }

    return {
      browser,
      os,
      device,
    };
  } catch (error) {
    // Handle any parsing errors gracefully
    // Return null values rather than throwing
    return {
      browser: null,
      os: null,
      device: null,
    };
  }
}
