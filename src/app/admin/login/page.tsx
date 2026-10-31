"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/site/navbar";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // already-signed-in admin goes straight to dashboard
  useEffect(() => {
    if (status === "authenticated" && (session.user as any).role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [status, session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your administrator credentials");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid administrator credentials");
      return;
    }
    // Authorization (ADMIN role) is enforced by middleware on /admin/dashboard
    // and re-checked in the dashboard layout. A non-admin will be redirected away.
    toast.success("Welcome, administrator");
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream grid place-items-center px-4 relative overflow-hidden">
      {/* ambient backdrop */}
      <div
        className="absolute inset-0 opacity-90"
        style={{ background: "radial-gradient(120% 90% at 50% 10%, #26282d 0%, #15161a 50%, #0e0f12 100%)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[50vh] rounded-full blur-[140px] opacity-25"
        style={{ background: "var(--electric)" }}
      />
      <div className="absolute inset-0 grain" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex"><BrandMark className="text-cream" /></div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-white/50">
            <ShieldCheck className="h-3 w-3" /> Admin Console
          </div>
        </div>

        <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-white/10">
          <h1 className="font-display text-2xl mb-1">Administrator sign in</h1>
          <p className="text-xs text-white/40 mb-6">Authorized personnel only.</p>

          {error && (
            <div className="rounded-xl bg-destructive/20 text-destructive text-xs px-4 py-3 mb-4 border border-destructive/30">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lumen.store"
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-cream outline-none focus:ring-2 focus:ring-electric/50 placeholder:text-white/25"
              />
            </label>
            <div>
              <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">Password</span>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 pr-12 text-sm text-cream outline-none focus:ring-2 focus:ring-electric/50 placeholder:text-white/25"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-cream"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
              <input type="checkbox" className="accent-electric" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Keep me signed in on this device
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-cream text-charcoal text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /> Sign in to console <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-white/5 p-3 text-[0.7rem] text-white/40 border border-white/5">
            <div className="text-white/60 font-medium mb-1">Demo administrator</div>
            admin@lumen.store · AdminLumen#2024
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 mx-auto block text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ← Back to storefront
        </button>
      </motion.div>
    </div>
  );
}
