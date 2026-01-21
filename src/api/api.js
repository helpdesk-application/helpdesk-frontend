// This file is the bridge for the API Team
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add token to every request for the Backend team
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export const fetchTickets = () => API.get('/tickets');
export const createTicket = (newTicket) => API.post('/tickets', newTicket);
export const updateTicket = (id, updatedTicket) => API.patch(`/tickets/${id}`, updatedTicket);