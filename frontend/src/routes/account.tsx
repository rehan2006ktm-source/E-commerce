import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, logout, loading } = useAuth();

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">You're signed out</h1>
        <Link to="/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl text-foreground">Account</h1>
      <div className="mt-8 rounded-lg border border-border p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Name</p>
        <p className="mt-1 text-lg text-foreground">{user?.name}</p>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Email</p>
        <p className="mt-1 text-lg text-foreground">{user?.email}</p>
        <button onClick={logout} className="mt-8 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
          Sign out
        </button>
      </div>
    </div>
  );
}
