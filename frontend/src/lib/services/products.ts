import { api, unwrap } from "../api";
import type { Product } from "../types";

export const productsService = {
  list: async (): Promise<Product[]> => {
    const { data } = await api.get("/products");
    const d = unwrap(data);
    return Array.isArray(d) ? d : (d as any)?.products ?? [];
  },
  get: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return unwrap(data);
  },
  search: async (q: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/search`, { params: { q, query: q } });
    const d = unwrap(data);
    return Array.isArray(d) ? d : (d as any)?.products ?? [];
  },
};
