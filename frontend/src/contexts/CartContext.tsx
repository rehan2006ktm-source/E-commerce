import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";
import { toast } from "sonner";

interface CartCtx {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ec_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add: CartCtx["add"] = (p, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product._id === p._id);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product: p, quantity: qty }];
    });
    toast.success(`Added "${p.name}" to cart`);
    setOpen(true);
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.product._id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => p.map((i) => (i.product._id === id ? { ...i, quantity: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.product.price) || 0) * i.quantity, 0),
    [items]
  );
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, isOpen, open: () => setOpen(true), close: () => setOpen(false), add, remove, setQty, clear, subtotal, count }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
