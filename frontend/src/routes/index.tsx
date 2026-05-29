import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import ceramicsImg from "@/assets/cat-ceramics.jpg";
import textilesImg from "@/assets/cat-textiles.jpg";
import objectsImg from "@/assets/cat-objects.jpg";
import { productsService } from "@/lib/services/products";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison — Considered objects for modern living" },
      { name: "description", content: "Premium curated home goods. Ceramics, textiles, and objects with intent." },
    ],
  }),
  component: Home,
});

const categories = [
  { name: "Ceramics", count: "24 pieces", img: ceramicsImg },
  { name: "Textiles", count: "18 pieces", img: textilesImg },
  { name: "Objects", count: "32 pieces", img: objectsImg },
];

function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.list,
    staleTime: 60_000,
  });

  const featured = (products ?? []).slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-12 md:gap-12 md:pt-20 lg:px-8">
          <div className="md:col-span-5 md:pt-12 fade-up">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Autumn / Winter Collection
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
              Quiet objects.<br />
              <span className="italic text-accent">Loud presence.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              A curated edit of handmade pieces for the rooms you live in.
              Built to last, made to be loved.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]">
                Shop the edit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/shop" className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                Explore stories
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
              {[["120+", "Artisans"], ["40", "Countries"], ["1.2k", "Reviews"]].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl text-foreground">{n}</dt>
                  <dd className="text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:col-span-7">
            <div className="relative overflow-hidden rounded-lg bg-muted">
              <img src={heroImg} alt="Featured collection still life" width={1600} height={1280}
                className="aspect-[4/5] w-full object-cover md:aspect-[5/6]" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between rounded-md bg-background/85 px-5 py-4 backdrop-blur">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Featured</p>
                  <p className="font-display text-lg">Hollow Vessel No. 04</p>
                </div>
                <Link to="/shop" className="text-xs font-medium text-foreground hover:underline">View →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Browse</p>
              <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">By category</h2>
            </div>
            <Link to="/shop" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">All categories →</Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.name} to="/shop" className="group relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                <img src={c.img} alt={c.name} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-background">
                  <div>
                    <h3 className="font-display text-2xl">{c.name}</h3>
                    <p className="mt-1 text-xs opacity-80">{c.count}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">This week</p>
            <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Featured pieces</h2>
          </div>
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">See all →</Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.length === 0
              ? <p className="col-span-full text-sm text-muted-foreground">No products available yet — check back soon.</p>
              : featured.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border/60 bg-ink text-background">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-4xl text-background sm:text-5xl">Slow letters,<br />arriving Sunday.</h2>
            <p className="mt-3 max-w-md text-sm text-background/70">
              Studio notes, new arrivals, and the occasional discount. No noise.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="your@email.com"
              className="h-12 flex-1 rounded-full border border-background/20 bg-transparent px-5 text-sm text-background placeholder:text-background/40 focus:border-background/60 focus:outline-none" />
            <button type="submit" className="rounded-full bg-background px-6 text-sm font-medium text-foreground hover:bg-background/90">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
