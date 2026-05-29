import { api, unwrap } from "../api";
import type { Category, Product } from "../types";

export const categoriesService = {
  list: async (): Promise<Category[]> => {
    const { data } = await api.get("/categories");
    const d = unwrap(data);
    return Array.isArray(d) ? d : (d as any)?.categories ?? [];
  },
  products: async (id: string): Promise<Product[]> => {
    const { data } = await api.get(`/categories/${id}/products`);
    const d = unwrap(data);
    return Array.isArray(d) ? d : (d as any)?.products ?? [];
  },
};
