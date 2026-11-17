import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export const publicAPI = {
  getDesigns: (params) => api.get('/designs', { params }),
  getDesignBySlug: (slug) => api.get(`/designs/${encodeURIComponent(slug)}`),
  getCategories: () => api.get('/categories'),
  getGallery: (params) => api.get('/gallery', { params }),
  getManufacturingStages: () => api.get('/manufacturing'),
  getAllContent: () => api.get('/content'),
  getContent: (section) => api.get(`/content/${encodeURIComponent(section)}`),
  submitEnquiry: (data) => api.post('/enquiries', data),
};

export default api;
