"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { AuthShell } from "@/components/site/auth-shell";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Valid email required");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      // auto sign in
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        toast.success("Account created", { description: "Please sign in." });
        router.push("/login");
      } else {
        toast.success("Welcome to LUMEN");
        router.push("/account");
        router.refresh();
      }
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join LUMEN"
      footer={
        <>
          Already have an account?{" "}
          <a href="/login" className="text-foreground underline underline-offset-4 hover:opacity-70">
            Sign in
          </a>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-xs px-4 py-3">{error}</div>
        )}
        <Field label="Full name" value={form.name} onChange={set("name")} placeholder="Aria Lumen" />
        <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
        <div>
          <label className="eyebrow text-muted-foreground text-[0.55rem] mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password")(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full h-12 rounded-xl border border-foreground/15 px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-electric/40"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    background: strength >= 3 ? "var(--electric)" : strength >= 2 ? "#c9c7c2" : "#d97706",
                  }}
                />
              </div>
              <span className="text-[0.65rem] text-muted-foreground w-14">{strengthLabel}</span>
            </div>
          )}
        </div>
        <Field label="Confirm password" type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" />

        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" className="accent-foreground mt-0.5" defaultChecked />
          <span>I agree to the <a href="#" className="underline underline-offset-4">Terms</a> and <a href="#" className="underline underline-offset-4">Privacy Policy</a>.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground text-[0.55rem] mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-foreground/15 px-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
      />
    </label>
  );
}
