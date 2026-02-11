// This file is the bridge for the API Team
import axios from 'axios';

// Point frontend API client to API gateway (which proxies to backend)
const API = axios.create({
  baseURL: 'http://localhost:2000/api',
  timeout: 10000
});

// Add token to every request for the Backend team
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// Auto logout on 401 (Unauthorized)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && !err.config.url.endsWith('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const fetchTickets = () => API.get('/tickets');
export const fetchTicketById = (id) => API.get(`/tickets/${id}`);
export const createTicket = (newTicket) => API.post('/tickets', newTicket);
export const updateTicket = (id, updatedTicket) => API.patch(`/tickets/${id}`, updatedTicket);
export const updateTicketStatus = (id, status) => API.patch(`/tickets/${id}/status`, { status });
export const assignTicket = (id, agentId) => API.patch(`/tickets/${id}/assign`, { assigned_agent_id: agentId });
export const fetchReplies = (ticketId) => API.get(`/tickets/${ticketId}/replies`);
export const postReply = (ticketId, message) => API.post(`/tickets/${ticketId}/replies`, { message });
export const fetchTicketHistory = (ticketId) => API.get(`/tickets/${ticketId}/history`);

// Analytics
export const fetchAnalytics = (range = 'monthly') => API.get(`/reports/summary?range=${range}`);

// Notifications
export const fetchNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (payload) => API.post('/auth/register', payload);
export const changePassword = (payload) => API.post('/auth/change-password', payload);

// Attachments
export const uploadAttachment = (formData) => API.post('/attachments', formData);
export const fetchAttachments = (ticketId) => API.get(`/attachments/ticket/${ticketId}`);
export const downloadAttachment = (filename) => `${API.defaults.baseURL}/attachments/download/${filename}`; // Direct link

// Knowledge Base
export const fetchArticles = () => API.get('/kb');
export const fetchKBCategories = () => API.get('/kb/categories');
export const searchArticles = (keyword) => API.get(`/kb/search?q=${encodeURIComponent(keyword)}`);
export const createArticle = (payload) => API.post('/kb', payload);
export const createKBCategory = (payload) => API.post('/kb/categories', payload);

// Users
export const fetchUsers = () => API.get('/users');
export const fetchUserActivities = () => API.get('/users/activities');
export const createUser = (payload) => API.post('/users', payload);
export const updateUser = (id, payload) => API.patch(`/users/${id}`, payload);
export const toggleUserStatus = (id) => API.patch(`/users/${id}/status`);
export const deleteUser = (id) => API.delete(`/users/${id}`);

export default API;