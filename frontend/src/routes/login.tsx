import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await login(email, password); navigate({ to: "/" }); } catch {} finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl text-foreground">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to your account.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none" />
        </label>
        <button disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/register" className="text-foreground underline underline-offset-4">Create an account</Link>
      </p>
    </div>
  );
}
