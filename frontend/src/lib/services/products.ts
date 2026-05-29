import { api, unwrap } from "../api";
import type { Product } from "../types";

function normalizeProduct(raw: Record<string, unknown>): Product {
  const title = raw.title as string | undefined;
  const name = (raw.name as string | undefined) ?? title ?? "Untitled";
  return { ...(raw as unknown as Product), name, title: title ?? name };
}

function normalizeList(items: unknown[]): Product[] {
  return items.map((item) => normalizeProduct(item as Record<string, unknown>));
}

export const productsService = {
  list: async (): Promise<Product[]> => {
    const { data } = await api.get("/products");
    const d = unwrap(data);
    const items = Array.isArray(d) ? d : (d as { products?: unknown[] })?.products ?? [];
    return normalizeList(items);
  },
  get: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return normalizeProduct(unwrap(data) as Record<string, unknown>);
  },
  search: async (q: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/search`, { params: { keyword: q, q } });
    const d = unwrap(data);
    const items = Array.isArray(d) ? d : (d as { products?: unknown[] })?.products ?? [];
    return normalizeList(items);
  },
};
