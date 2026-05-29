import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { productsService } from "@/lib/services/products";
import { categoriesService } from "@/lib/services/categories";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Maison" },
      { name: "description", content: "Browse the full catalog of curated home goods." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: productsService.list, staleTime: 60_000 });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoriesService.list, staleTime: 5 * 60_000 });

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const priceCap = useMemo(() => {
    const max = Math.max(0, ...((products ?? []).map((p) => Number(p.price) || 0)));
    return Math.ceil(max || 500);
  }, [products]);

  const visible = useMemo(() => {
    const list = products ?? [];
    return list.filter((p) => {
      if (q && !p.name?.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat) {
        const cid = typeof p.category === "string" ? p.category : p.category?._id;
        if (cid !== cat) return false;
      }
      if (inStock && (p.stock ?? 1) <= 0) return false;
      if (maxPrice && Number(p.price) > maxPrice) return false;
      return true;
    });
  }, [products, q, cat, inStock, maxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Catalog</p>
        <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">Shop everything</h1>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        {/* SIDEBAR */}
        <aside className="space-y-8">
          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Search</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Category</p>
            <div className="mt-3 space-y-1.5">
              <button onClick={() => setCat("")} className={`block w-full text-left text-sm ${!cat ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>All</button>
              {(categories ?? []).map((c) => (
                <button key={c._id} onClick={() => setCat(c._id)} className={`block w-full text-left text-sm ${cat === c._id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Max price</p>
            <input
              type="range" min={0} max={priceCap} step={10}
              value={maxPrice || priceCap}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">Up to ${maxPrice || priceCap}</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-foreground" />
            In stock only
          </label>
        </aside>

        {/* GRID */}
        <section>
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>{isLoading ? "Loading..." : `${visible.length} pieces`}</span>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-display text-2xl text-foreground">Nothing matches your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting the search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {visible.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
