import crypto from 'crypto';

/**
 * Anonymizes IP addresses using SHA-256 hashing for GDPR compliance.
 *
 * This function converts IP addresses to one-way hashed values that:
 * - Cannot be reversed to obtain the original IP
 * - Produce consistent hashes for the same IP (for analytics tracking)
 * - Use SHA-256 (not MD5/SHA1 which are cryptographically weak)
 *
 * @param ip - IP address to anonymize (IPv4 or IPv6)
 * @returns SHA-256 hash of the IP address in hexadecimal format, or null if input is invalid
 */
export function anonymizeIP(ip: string | null | undefined): string | null {
  // Handle null, undefined, or empty input gracefully
  if (!ip || typeof ip !== 'string' || ip.trim() === '') {
    return null;
  }

  try {
    // Create SHA-256 hash of the IP address
    // Using 'utf8' encoding for the input string
    const hash = crypto
      .createHash('sha256')
      .update(ip.trim())
      .digest('hex');

    // Return the hash without logging the raw IP (GDPR compliance)
    return hash;
  } catch (error) {
    // Handle any hashing errors gracefully
    // Do not log the raw IP address for privacy
    return null;
  }
}
