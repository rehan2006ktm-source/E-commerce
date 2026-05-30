import { create } from 'zustand';
import api from '../config/axios';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  location?: string;
  avatar?: string;
  wallet?: number;
  // Seller fields
  panNumber?: string;
  gstNumber?: string;
  bankAccountNumber?: number;
  ifscCode?: string;
  addressProof?: string;
  businessAddress?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: FormData) => Promise<UserProfile>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<UserProfile | null>;
  updateProfile: (data: { name: string; location?: string }) => Promise<UserProfile>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users/login', { email, password });
      const userData = response.data.data.user;
      set({ user: userData, isAuthenticated: true, isLoading: false });
      return userData;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const userData = response.data.data;
      // Note: backend register endpoint registers user, but does not auto-login (no cookies set in register).
      // We will return the created user and let pages redirect or prompt login.
      set({ isLoading: false });
      return userData;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/users/logout');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err: any) {
      set({ user: null, isAuthenticated: false, isLoading: false }); // Force clear state on client anyway
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users/current-user');
      const userData = response.data.data;
      set({ user: userData, isAuthenticated: true, isLoading: false });
      return userData;
    } catch (err: any) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch('/users/update-profile', profileData);
      const updatedUser = response.data.data;
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },
}));
