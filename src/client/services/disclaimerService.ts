const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Disclaimer configuration interface
 */
export interface DisclaimerConfig {
  banner: {
    en: string;
    es: string;
  };
  footer: {
    en: string;
    es: string;
  };
}

/**
 * Default fallback disclaimers in case of API failure
 */
const DEFAULT_DISCLAIMERS: DisclaimerConfig = {
  banner: {
    en: '⚠️ FICTIONAL CONTENT - This article is entirely fictional',
    es: '⚠️ CONTENIDO FICTICIO - Este artículo es completamente ficticio',
  },
  footer: {
    en: 'This article is entirely fictional and created for entertainment purposes only. All names, characters, events, and locations are products of imagination. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.',
    es: 'Este artículo es completamente ficticio y creado solo con fines de entretenimiento. Todos los nombres, personajes, eventos y ubicaciones son productos de la imaginación. Cualquier parecido con personas reales, vivas o muertas, o eventos reales es pura coincidencia.',
  },
};

/**
 * In-memory cache for disclaimer configuration
 */
let cachedConfig: DisclaimerConfig | null = null;

/**
 * Fetch disclaimer configuration from the backend.
 * Results are cached in memory to reduce API calls.
 * Falls back to default disclaimers if the API fails.
 *
 * @returns Promise resolving to DisclaimerConfig
 */
export async function getDisclaimerConfig(): Promise<DisclaimerConfig> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch(`${API_URL}/config/disclaimers`);

    if (!response.ok) {
      console.warn('Failed to fetch disclaimer config, using defaults');
      cachedConfig = DEFAULT_DISCLAIMERS;
      return cachedConfig;
    }

    const data = await response.json();

    // Validate the response structure
    if (
      data &&
      data.banner &&
      data.footer &&
      typeof data.banner.en === 'string' &&
      typeof data.banner.es === 'string' &&
      typeof data.footer.en === 'string' &&
      typeof data.footer.es === 'string'
    ) {
      cachedConfig = data;
      return cachedConfig;
    } else {
      console.warn('Invalid disclaimer config structure, using defaults');
      cachedConfig = DEFAULT_DISCLAIMERS;
      return cachedConfig;
    }
  } catch (error) {
    console.error('Error fetching disclaimer config:', error);
    cachedConfig = DEFAULT_DISCLAIMERS;
    return cachedConfig;
  }
}

/**
 * Clear the cached disclaimer configuration.
 * Useful for testing or forcing a refresh.
 */
export function clearDisclaimerCache(): void {
  cachedConfig = null;
}
