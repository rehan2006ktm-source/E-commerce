import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/lib/services/orders";
import { useAuth } from "@/contexts/AuthContext";
import { fmt } from "@/contexts/CartContext";

export const Route = createFileRoute("/orders")({ component: Orders });

function Orders() {
  const { user, loading } = useAuth();
  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ["orders", user?._id],
    queryFn: ordersService.myOrders,
    enabled: !!user,
  });

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Sign in to view orders</h1>
        <Link to="/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-foreground">Your orders</h1>

      <div className="mt-10 space-y-4">
        {(isLoading || loading) && [1,2,3].map((i) => <div key={i} className="h-24 rounded-lg bg-muted shimmer" />)}
        {isError && (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load orders"}
          </p>
        )}
        {!isLoading && !isError && (!orders || orders.length === 0) && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
        {orders?.map((o: any) => (
          <div key={o._id} className="flex items-center justify-between rounded-lg border border-border p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Order #{o._id?.slice(-6)}</p>
              <p className="mt-1 font-medium text-foreground">
                {(o.products?.length ?? o.items?.length ?? 0)} items · {o.status ?? "Processing"}
              </p>
              <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">{o.location}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.createdAt ?? Date.now()).toLocaleDateString()}</p>
            </div>
            <p className="font-display text-2xl text-foreground">{fmt(o.price ?? o.totalAmount ?? 0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
