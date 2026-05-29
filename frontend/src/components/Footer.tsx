import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-2xl">Maison.</h3>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Considered objects for the modern home. Shipped worldwide.
          </p>
        </div>
        {[
          { title: "Shop", links: [["All products", "/shop"], ["New arrivals", "/shop"], ["Bestsellers", "/shop"]] },
          { title: "Support", links: [["Contact", "/"], ["Shipping", "/"], ["Returns", "/"]] },
          { title: "Account", links: [["Sign in", "/login"], ["Register", "/register"], ["Orders", "/orders"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Maison Studio</span>
          <span>Crafted with care</span>
        </div>
      </div>
    </footer>
  );
}
