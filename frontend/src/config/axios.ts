import axios from 'axios';

const api = axios.create({
  baseURL: 'https://e-commerce-2-zpg7.onrender.com/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
