import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { message: err.message });
  }
);

export const AdminAPI = {
  // Auth
  login: (data) => api.post('/auth/login', data),

  // Stats & Analytics
  getStats:       () => api.get('/admin/stats'),
  getUserGrowth:  (days = 30) => api.get(`/admin/analytics/growth?days=${days}`),
  getAnalytics:   () => api.get('/admin/analytics'),
  getMatches:     () => api.get('/admin/matches'),

  // Users
  getUsers:    (params) => api.get('/admin/users',     { params }),
  getUserById: (id)     => api.get(`/admin/users/${id}`),
  updateUser:  (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser:  (id)     => api.delete(`/admin/users/${id}`),

  // Community
  getPosts:    (params) => api.get('/admin/community',      { params }),
  deletePost:  (id)     => api.delete(`/admin/community/${id}`),
  featurePost: (id)     => api.patch(`/admin/community/${id}/feature`),

  // Reports
  getReports:   (params) => api.get('/admin/reports',     { params }),
  handleReport: (id, data) => api.patch(`/admin/reports/${id}`, data),

  // Subscriptions
  getSubscriptions:  (params)   => api.get('/admin/subscriptions',      { params }),
  updateSubscription:(id, data) => api.patch(`/admin/subscriptions/${id}`, data),

  // Broadcast
  broadcast: (data) => api.post('/admin/broadcast', data),
};

export default api;
