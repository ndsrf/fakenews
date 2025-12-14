const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions extends RequestInit {
  token?: string;
}

/**
 * Generic API request helper
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.details 
      ? `${data.error}: ${data.details.map((d: any) => d.message || d.code).join(', ')}`
      : (data.error || 'An error occurred');
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Auth API
 */
export const authApi = {
  register: (userData: {
    email: string;
    password: string;
    name: string;
    language?: string;
  }) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: (token: string) =>
    apiRequest('/auth/me', {
      method: 'GET',
      token,
    }),

  logout: (token: string) =>
    apiRequest('/auth/logout', {
      method: 'POST',
      token,
    }),
};

/**
 * Users API
 */
export const usersApi = {
  getAllUsers: (token: string) =>
    apiRequest('/users', {
      method: 'GET',
      token,
    }),

  getPendingUsers: (token: string) =>
    apiRequest('/users/pending', {
      method: 'GET',
      token,
    }),

  approveUser: (userId: string, token: string) =>
    apiRequest(`/users/${userId}/approve`, {
      method: 'PUT',
      token,
    }),

  updateUserRole: (userId: string, role: string, token: string) =>
    apiRequest(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
      token,
    }),

  deleteUser: (userId: string, token: string) =>
    apiRequest(`/users/${userId}`, {
      method: 'DELETE',
      token,
    }),

  updateProfile: (userData: any, token: string) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
      token,
    }),
};

/**
 * Brands API
 */
export const brandsApi = {
  getAllBrands: (token: string) =>
    apiRequest('/brands', {
      method: 'GET',
      token,
    }),

  getBrand: (brandId: string, token: string) =>
    apiRequest(`/brands/${brandId}`, {
      method: 'GET',
      token,
    }),

  createBrand: (brandData: {
    name: string;
    tagline?: string;
    description: string;
    websiteUrl: string;
    categories: string[];
    language?: string;
    primaryColor?: string;
    accentColor?: string;
  }, token: string) =>
    apiRequest('/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
      token,
    }),

  updateBrand: (brandId: string, brandData: any, token: string) =>
    apiRequest(`/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
      token,
    }),

  deleteBrand: (brandId: string, token: string) =>
    apiRequest(`/brands/${brandId}`, {
      method: 'DELETE',
      token,
    }),

  generateLogo: (logoData: {
    brandName: string;
    tagline?: string;
    style: string;
    primaryColor: string;
    accentColor?: string;
    aiProvider: 'openai' | 'anthropic' | 'gemini';
    useAI?: boolean;
  }, token: string) =>
    apiRequest<{
      variations: {
        horizontal: string;
        vertical: string;
        iconOnly: string;
        monochrome: string;
      };
      metadata: {
        style: string;
        colors: {
          primary: string;
          accent?: string;
        };
        generatedAt: string;
        provider: string;
      };
      aiGenerated: string | null;
    }>('/brands/generate-logo', {
      method: 'POST',
      body: JSON.stringify(logoData),
      token,
    }),
};

/**
 * Templates API
 */
export const templatesApi = {
  getAllTemplates: (token: string) =>
    apiRequest('/templates', {
      method: 'GET',
      token,
    }),

  getTemplate: (templateId: string, token: string) =>
    apiRequest(`/templates/${templateId}`, {
      method: 'GET',
      token,
    }),

  createTemplate: (templateData: {
    name: string;
    type: string;
    brandId?: string;
    cssStyles: string;
    htmlStructure: string;
    language?: string;
    hasSidebar?: boolean;
  }, token: string) =>
    apiRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
      token,
    }),

  updateTemplate: (templateId: string, templateData: any, token: string) =>
    apiRequest(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
      token,
    }),

  deleteTemplate: (templateId: string, token: string) =>
    apiRequest(`/templates/${templateId}`, {
      method: 'DELETE',
      token,
    }),

  extractTemplate: (extractData: {
    url: string;
    name: string;
    brandId?: string;
  }, token: string) =>
    apiRequest('/templates/extract', {
      method: 'POST',
      body: JSON.stringify(extractData),
      token,
    }),
};

/**
 * Articles API
 */
export const articlesApi = {
  getAllArticles: async (token: string, filters?: {
    status?: string;
    brandId?: string;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.brandId) queryParams.append('brandId', filters.brandId);
    if (filters?.category) queryParams.append('category', filters.category);

    const query = queryParams.toString();
    const response = await apiRequest<{ articles: any[]; pagination: any }>(`/articles${query ? `?${query}` : ''}`, {
      method: 'GET',
      token,
    });
    return response.articles;
  },

  getArticle: (articleId: string, token: string) =>
    apiRequest(`/articles/${articleId}`, {
      method: 'GET',
      token,
    }),

  getArticleBySlug: (slug: string) =>
    apiRequest(`/articles/slug/${slug}`, {
      method: 'GET',
    }),

  generateArticle: (generationData: {
    brandId: string;
    templateId: string;
    topic: string;
    tone: 'serious' | 'satirical' | 'dramatic' | 'investigative';
    length: 'short' | 'medium' | 'long';
    category: string;
    includeQuotes: boolean;
    includeStatistics: boolean;
    includeCharts: boolean;
    generateRelatedTitles: number;
    language: 'en' | 'es';
    aiProvider: 'openai' | 'anthropic' | 'gemini';
  }, token: string) =>
    apiRequest('/articles/generate', {
      method: 'POST',
      body: JSON.stringify(generationData),
      token,
    }),

  createArticle: (articleData: {
    title: string;
    subtitle?: string;
    content: string;
    excerpt: string;
    language: string;
    category: string;
    templateId: string;
    brandId: string;
    authorName: string;
    slug: string;
    tags?: string[];
  }, token: string) =>
    apiRequest('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
      token,
    }),

  updateArticle: (articleId: string, articleData: any, token: string) =>
    apiRequest(`/articles/${articleId}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
      token,
    }),

  deleteArticle: (articleId: string, token: string) =>
    apiRequest(`/articles/${articleId}`, {
      method: 'DELETE',
      token,
    }),

  publishArticle: (articleId: string, token: string) =>
    apiRequest(`/articles/${articleId}/publish`, {
      method: 'PUT',
      token,
    }),
};

/**
 * Version API
 */
export const versionApi = {
  getVersion: () => apiRequest('/version', { method: 'GET' }),
};

export default {
  auth: authApi,
  users: usersApi,
  brands: brandsApi,
  templates: templatesApi,
  articles: articlesApi,
  version: versionApi,
};
