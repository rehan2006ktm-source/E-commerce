import { api, unwrap } from "../api";

export const ordersService = {
  create: async (payload: any) => {
    const { data } = await api.post("/orders/create", payload);
    return unwrap(data);
  },
  myOrders: async () => {
    const { data } = await api.get("/orders/my-orders");
    return unwrap(data) as any[];
  },
  get: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return unwrap(data);
  },
  track: async (id: string) => {
    const { data } = await api.get(`/orders/${id}/track`);
    return unwrap(data);
  },
};
