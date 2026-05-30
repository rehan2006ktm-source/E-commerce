import { create } from 'zustand';
import api from '../config/axios';
import { useAuthStore } from './authStore';

export interface ProductDetails {
  _id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  rating?: number;
  category?: string;
  owner?: string;
}

export interface CartItem {
  product: ProductDetails;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (product: ProductDetails, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => {
  // Helper to load guest cart from localStorage
  const loadLocalCart = (): { items: CartItem[]; totalPrice: number } => {
    try {
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.items) && typeof parsed.totalPrice === 'number') {
          return parsed;
        }
      }
    } catch {}
    return { items: [], totalPrice: 0 };
  };

  // Helper to save guest cart to localStorage
  const saveLocalCart = (items: CartItem[]) => {
    const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    localStorage.setItem('guest_cart', JSON.stringify({ items, totalPrice }));
    set({ items, totalPrice });
  };

  return {
    items: loadLocalCart().items,
    totalPrice: loadLocalCart().totalPrice,
    isLoading: false,
    error: null,

    fetchCart: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        const local = loadLocalCart();
        set({ items: local.items, totalPrice: local.totalPrice });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await api.get('/cart');
        // Backend returns: { success: true, data: { items: [ { product: {...}, quantity: 1 } ], totalPrice: 100 } }
        const cartData = response.data.data;
        if (cartData) {
          // If items contains null products, filter them out to prevent front-end crashes
          const validItems = (cartData.items || []).filter((item: any) => item.product !== null);
          set({
            items: validItems,
            totalPrice: cartData.totalPrice || 0,
            isLoading: false,
          });
        } else {
          set({ items: [], totalPrice: 0, isLoading: false });
        }
      } catch (err: any) {
        set({ error: err.response?.data?.message || 'Failed to fetch cart', isLoading: false });
      }
    },

    addToCart: async (product, quantity = 1) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        const currentItems = [...get().items];
        const existIdx = currentItems.findIndex((item) => item.product._id === product._id);
        if (existIdx > -1) {
          currentItems[existIdx].quantity += quantity;
        } else {
          currentItems.push({ product, quantity });
        }
        saveLocalCart(currentItems);
        return;
      }

      set({ isLoading: true, error: null });
      try {
        await api.post('/cart', { productId: product._id, quantity });
        set({ isLoading: false });
        // Refetch cart from backend to get populated and synced values
        await get().fetchCart();
      } catch (err: any) {
        set({ error: err.response?.data?.message || 'Failed to add item to cart', isLoading: false });
      }
    },

    updateCartQuantity: async (productId, quantity) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (quantity <= 0) {
        await get().removeFromCart(productId);
        return;
      }

      if (!isAuthenticated) {
        const currentItems = get().items.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        saveLocalCart(currentItems);
        return;
      }

      set({ isLoading: true, error: null });
      try {
        await api.patch('/cart/item', { productId, quantity });
        set({ isLoading: false });
        await get().fetchCart();
      } catch (err: any) {
        set({ error: err.response?.data?.message || 'Failed to update quantity', isLoading: false });
      }
    },

    removeFromCart: async (productId) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        const currentItems = get().items.filter((item) => item.product._id !== productId);
        saveLocalCart(currentItems);
        return;
      }

      set({ isLoading: true, error: null });
      try {
        // Backend expects { productId } in body for DELETE /cart/item
        await api.delete('/cart/item', { data: { productId } });
        set({ isLoading: false });
        await get().fetchCart();
      } catch (err: any) {
        set({ error: err.response?.data?.message || 'Failed to remove item', isLoading: false });
      }
    },

    clearCart: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        localStorage.removeItem('guest_cart');
        set({ items: [], totalPrice: 0 });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        await api.delete('/cart/clear');
        set({ items: [], totalPrice: 0, isLoading: false });
      } catch (err: any) {
        set({ error: err.response?.data?.message || 'Failed to clear cart', isLoading: false });
      }
    },
  };
});
