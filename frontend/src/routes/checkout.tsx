import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useCart, fmt } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/lib/services/orders";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? "", email: user?.email ?? "",
    address: "", city: "", postal: "", country: "",
    card: "", exp: "", cvc: "",
  });

  const shipping = subtotal > 150 ? 0 : 12;
  const total = subtotal + shipping;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to place an order."); navigate({ to: "/login" }); return; }
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const order = await ordersService.create({
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity, price: i.product.price })),
        shippingAddress: {
          fullName: form.name, address: form.address, city: form.city,
          postalCode: form.postal, country: form.country,
        },
        paymentMethod: "card",
        totalAmount: total,
      });
      toast.success("Order placed successfully");
      clear();
      const id = (order as any)?._id || (order as any)?.id;
      navigate({ to: id ? "/orders" : "/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add a few things before checking out.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-foreground sm:text-5xl">Checkout</h1>
      <form onSubmit={submit} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl">Contact</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={set("name")} required />
              <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl">Shipping</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field className="sm:col-span-2" label="Address" value={form.address} onChange={set("address")} required />
              <Field label="City" value={form.city} onChange={set("city")} required />
              <Field label="Postal code" value={form.postal} onChange={set("postal")} required />
              <Field label="Country" value={form.country} onChange={set("country")} required />
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl">Payment</h2>
            <p className="mt-1 text-xs text-muted-foreground">Demo only — no card is actually charged.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field className="sm:col-span-2" label="Card number" value={form.card} onChange={set("card")} placeholder="4242 4242 4242 4242" required />
              <Field label="Expiry" value={form.exp} onChange={set("exp")} placeholder="MM / YY" required />
              <Field label="CVC" value={form.cvc} onChange={set("cvc")} placeholder="123" required />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-secondary/30 p-6">
          <h3 className="font-display text-2xl">Order summary</h3>
          <ul className="mt-4 divide-y divide-border">
            {items.map((i) => (
              <li key={i.product._id} className="flex justify-between py-3 text-sm">
                <span className="truncate text-foreground">{i.product.name} × {i.quantity}</span>
                <span className="text-foreground">{fmt(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : fmt(shipping)}</dd></div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground">
              <dt>Total</dt><dd>{fmt(total)}</dd>
            </div>
          </dl>
          <button disabled={submitting}
            className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {submitting ? "Placing order..." : `Place order — ${fmt(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input {...rest}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none" />
    </label>
  );
}
