import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function Navbar() {
  const { count, open } = useCart();
  const { user } = useAuth();
  const [mobile, setMobile] = useState(false);

  // #region agent log
  useEffect(() => {
    const cartBtn = document.querySelector('button[aria-label="Cart"]');
    fetch('http://127.0.0.1:7816/ingest/d5ea4e40-392a-4df8-8cba-5ae32091630d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3f2db'},body:JSON.stringify({sessionId:'b3f2db',runId:'pre-fix',hypothesisId:'A',location:'Navbar.tsx:useEffect',message:'hydration extension attrs check',data:{hasFdProcessedId:cartBtn?.hasAttribute('fdprocessedid'),fdProcessedId:cartBtn?.getAttribute('fdprocessedid')??null},timestamp:Date.now()})}).catch(()=>{});
  }, []);
  // #endregion

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/orders", label: "Orders" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button className="md:hidden text-foreground" onClick={() => setMobile((v) => !v)} aria-label="Menu">
          {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-display text-2xl tracking-tight text-foreground">
          Maison<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/shop" className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <Link to={user ? "/account" : "/login"} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Account">
            <User className="h-4 w-4" />
          </Link>
          <button onClick={open} className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <nav className="flex flex-col px-4 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="py-2 text-sm text-foreground" onClick={() => setMobile(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
