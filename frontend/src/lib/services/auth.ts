import { api, tokenStore, unwrap } from "../api";
import type { User } from "../types";

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // #region agent log
    fetch('http://127.0.0.1:7816/ingest/d5ea4e40-392a-4df8-8cba-5ae32091630d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3f2db'},body:JSON.stringify({sessionId:'b3f2db',runId:'pre-fix',hypothesisId:'E',location:'auth.ts:login',message:'login request start',data:{apiBase:import.meta.env.VITE_API_URL??'default'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const { data } = await api.post("/users/login", { email, password });
    const d = unwrap(data) as { user: User; accessToken: string };
    if (d.accessToken) tokenStore.set(d.accessToken);
    return d.user;
  },
  register: async (payload: FormData | Record<string, any>): Promise<User> => {
    const isForm = payload instanceof FormData;
    const { data } = await api.post("/users/register", payload, {
      headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return unwrap(data) as User;
  },
  logout: async (): Promise<void> => {
    try { await api.post("/users/logout"); } finally { tokenStore.clear(); }
  },
  me: async (): Promise<User> => {
    const { data } = await api.get("/users/current-user");
    return unwrap(data) as User;
  },
};
