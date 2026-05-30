import { create } from 'zustand';
import api from '../config/axios';
import type { UserProfile } from './authStore';

export interface ReviewDetails {
  _id: string;
  user: UserProfile | string;
  product: string;
  product_id?: any;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewState {
  productReviews: Record<string, ReviewDetails[]>; // Keyed by productId
  myReviews: ReviewDetails[];
  isLoading: boolean;
  error: string | null;
  fetchProductReviews: (productId: string) => Promise<ReviewDetails[]>;
  addReview: (productId: string, rating: number, comment: string) => Promise<ReviewDetails>;
  updateReview: (reviewId: string, rating: number, comment: string) => Promise<ReviewDetails>;
  deleteReview: (reviewId: string) => Promise<void>;
  fetchMyReviews: () => Promise<ReviewDetails[]>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  productReviews: {},
  myReviews: [],
  isLoading: false,
  error: null,

  fetchProductReviews: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      const reviews = response.data.data || [];
      set((state) => ({
        productReviews: { ...state.productReviews, [productId]: reviews },
        isLoading: false,
      }));
      return reviews;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch reviews';
      set({ error: errMsg, isLoading: false });
      return [];
    }
  },

  addReview: async (productId, rating, comment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/reviews', { productId, rating, comment });
      const newReview = response.data.data;
      set({ isLoading: false });
      // Reload reviews for this product
      await get().fetchProductReviews(productId);
      return newReview;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to submit review';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updateReview: async (reviewId, rating, comment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
      const updated = response.data.data;
      set({ isLoading: false });
      // If we are currently holding product/user reviews, sync them
      if (updated.product) {
        await get().fetchProductReviews(updated.product);
      }
      await get().fetchMyReviews();
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to edit review';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deleteReview: async (reviewId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/reviews/${reviewId}`);
      set({ isLoading: false });
      // Fetch reviews again to keep arrays clean
      await get().fetchMyReviews();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to delete review';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  fetchMyReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/reviews/me');
      const reviews = response.data.data || [];
      set({ myReviews: reviews, isLoading: false });
      return reviews;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch your reviews';
      set({ error: errMsg, isLoading: false });
      return [];
    }
  },
}));
