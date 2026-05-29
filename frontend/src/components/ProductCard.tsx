import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/types";
import { fmt } from "@/contexts/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] || product.image;
  return (
    <Link
      to="/products/$productId"
      params={{ productId: product._id }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
        {img ? (
          <img src={img} alt={product.name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {(product.stock ?? 1) <= 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="truncate text-sm font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{fmt(product.price)}</p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] w-full rounded-md bg-muted shimmer" />
      <div className="mt-3 h-3 w-2/3 rounded bg-muted shimmer" />
      <div className="mt-2 h-3 w-1/4 rounded bg-muted shimmer" />
    </div>
  );
}
