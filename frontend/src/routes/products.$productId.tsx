import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { productsService } from "@/lib/services/products";
import { useCart, fmt } from "@/contexts/CartContext";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.get(productId),
  });
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [variants, setVariants] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="aspect-square w-full rounded-lg bg-muted shimmer" />
        <div className="space-y-4">
          <div className="h-6 w-2/3 rounded bg-muted shimmer" />
          <div className="h-10 w-1/2 rounded bg-muted shimmer" />
          <div className="h-24 w-full rounded bg-muted shimmer" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/shop" className="text-xs text-muted-foreground hover:text-foreground">← Back to shop</Link>

      <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* GALLERY */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {images[activeImg]
              ? <img src={images[activeImg]} alt={product.name} className="h-full w-full object-cover" />
              : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded border-2 ${i === activeImg ? "border-foreground" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="md:pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {typeof product.category === "object" ? product.category?.name : "Collection"}
          </p>
          <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating ?? 4.5) ? "fill-accent text-accent" : "text-muted"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{(product.rating ?? 4.5).toFixed(1)} · 128 reviews</span>
          </div>

          <p className="mt-6 font-display text-3xl text-foreground">{fmt(product.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description || "A considered piece designed to last. Crafted from premium materials with attention to every detail."}
          </p>

          {product.variants?.map((v) => (
            <div key={v.name} className="mt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{v.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button key={opt} onClick={() => setVariants((p) => ({ ...p, [v.name]: opt }))}
                    className={`rounded-full border px-4 py-1.5 text-sm ${variants[v.name] === opt ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={() => add(product, qty)}
              className="flex-1 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]">
              Add to bag — {fmt(product.price * qty)}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5 text-center"><Truck className="h-4 w-4" /><span>Free over $150</span></div>
            <div className="flex flex-col items-center gap-1.5 text-center"><RotateCcw className="h-4 w-4" /><span>30-day returns</span></div>
            <div className="flex flex-col items-center gap-1.5 text-center"><ShieldCheck className="h-4 w-4" /><span>2-yr warranty</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
