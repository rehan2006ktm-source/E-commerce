import { useState, useEffect, useCallback } from 'react';
import api from '../config/axios';
import type { ProductDetails } from '../store/cartStore';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/products');
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      return fetchAllProducts();
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search products');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllProducts]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchAllProducts,
    searchProducts,
  };
};

export const useSingleProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
};
