import { useCart, fmt } from "@/contexts/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-2xl">Your bag</h2>
          <button onClick={close} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-xl text-foreground">Your bag is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">Discover something you'll love.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((i) => {
                const img = i.product.images?.[0] || i.product.image;
                return (
                  <li key={i.product._id} className="flex gap-4 py-5">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded bg-muted">
                      {img && <img src={img} alt={i.product.name} className="h-full w-full object-cover" loading="lazy" />}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{i.product.name}</p>
                        <p className="text-sm text-foreground">{fmt(i.product.price * i.quantity)}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{fmt(i.product.price)} each</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button onClick={() => setQty(i.product._id, i.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-xs">{i.quantity}</span>
                          <button onClick={() => setQty(i.product._id, i.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => remove(i.product._id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-secondary/30 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{fmt(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={() => { close(); navigate({ to: "/checkout" }); }}
              className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Checkout · {fmt(subtotal)}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
