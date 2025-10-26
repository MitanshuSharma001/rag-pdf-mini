import axios from 'axios' 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000' 

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
}) 

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') 
  if (token) {
    config.headers.Authorization = `Bearer ${token}` 
  }
  return config 
}) 

// Auth APIs
export const signup = (email) => api.post('/auth/signup', { email }) 
export const verifyOTP = (email, otp, password) => api.post('/auth/verify-otp', { email, otp, password }) 
export const resendOTP = (email) => api.post('/auth/resend-otp', { email }) 
export const login = (email, password) => api.post('/auth/login', { email, password }) 
export const getProfile = () => api.get('/auth/profile') 

// Chat APIs
export const getChatHistory = () => api.get('/chat/history') 
export const createNewChat = () => api.post('/chat/new') 
export const getChatById = (chatId) => api.get(`/chat/${chatId}`) 
export const deleteChat = (chatId) => api.delete(`/chat/${chatId}`) 
export const updateChatTitle = (chatId, title) => api.patch(`/chat/${chatId}/title`, { title }) 

// File upload
export const uploadPDF = (file) => {
  const formData = new FormData() 
  formData.append('pdf', file) 
  return api.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) 
} 

export default api 