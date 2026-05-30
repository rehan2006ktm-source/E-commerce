import { create } from 'zustand';
import api from '../config/axios';

export interface PaymentRecord {
  _id: string;
  user_id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mode_of_payment: 'card' | 'cod' | 'upi';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  paymentsList: PaymentRecord[];
  isLoading: boolean;
  error: string | null;
  createPayment: (orderId: string, amount: number, modeOfPayment: 'card' | 'cod' | 'upi') => Promise<PaymentRecord>;
  fetchMyPayments: () => Promise<PaymentRecord[]>;
  fetchPaymentDetails: (paymentId: string) => Promise<PaymentRecord>;
  updatePaymentStatus: (paymentId: string, status: PaymentRecord['status']) => Promise<PaymentRecord>;
  deletePayment: (paymentId: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentsList: [],
  isLoading: false,
  error: null,

  createPayment: async (orderId, amount, modeOfPayment) => {
    set({ isLoading: true, error: null });
    try {
      // Mock generate transaction token
      const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      const response = await api.post('/payments', {
        order_id: orderId,
        amount,
        mode_of_payment: modeOfPayment,
        transactionId,
        status: modeOfPayment === 'cod' ? 'pending' : 'completed',
      });
      set({ isLoading: false });
      return response.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Payment initiation failed';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  fetchMyPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/payments');
      const list = response.data.data || [];
      set({ paymentsList: list, isLoading: false });
      return list;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch payment records';
      set({ error: errMsg, isLoading: false });
      return [];
    }
  },

  fetchPaymentDetails: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/payments/${paymentId}`);
      set({ isLoading: false });
      return response.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch payment transaction details';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updatePaymentStatus: async (paymentId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/payments/${paymentId}`, { status });
      set({ isLoading: false });
      return response.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to change transaction status';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deletePayment: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/payments/${paymentId}`);
      set((state) => ({
        paymentsList: state.paymentsList.filter((p) => p._id !== paymentId),
        isLoading: false,
      }));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to purge payment transaction record';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },
}));
