import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/lib/services/auth";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("role", "customer");
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await authService.register(fd);
      toast.success("Account created. Please sign in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl text-foreground">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Join us — it takes a minute.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        {([["Name","name","text"],["Email","email","email"],["Password","password","password"],["Location","location","text"]] as const).map(([label, key, type]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
            <input type={type} required value={form[key]} onChange={set(key)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none" />
          </label>
        ))}
        <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member? <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}
