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
    throw new Error(data.error || 'An error occurred');
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
 * Version API
 */
export const versionApi = {
  getVersion: () => apiRequest('/version', { method: 'GET' }),
};

export default {
  auth: authApi,
  users: usersApi,
  version: versionApi,
};
