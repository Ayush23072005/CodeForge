import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codeforge-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('codeforge-token');
      // Don't redirect — let the app handle it
    }
    return Promise.reject(error);
  }
);

// API functions
export const runCode = (code, language, input = '') => {
  return api.post('/run', { code, language, input });
};

export const getHealth = () => {
  return api.get('/health');
};

export const saveSnippet = (title, language, code, isPublic = false) => {
  return api.post('/snippets', { title, language, code, isPublic });
};

export const getSnippets = () => {
  return api.get('/snippets');
};

export const getSnippet = (id) => {
  return api.get(`/snippets/${id}`);
};

export const deleteSnippet = (id) => {
  return api.delete(`/snippets/${id}`);
};

export const getSharedSnippet = (shareId) => {
  return api.get(`/snippets/share/${shareId}`);
};

export const getHistory = () => {
  return api.get('/snippets/user/history');
};

export default api;
