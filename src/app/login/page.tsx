"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/site/auth-shell";
import { toast } from "sonner";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    toast.success("Welcome back");
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          New to LUMEN?{" "}
          <a href="/register" className="text-foreground underline underline-offset-4 hover:opacity-70">
            Create an account
          </a>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-xs px-4 py-3">
            {error}
          </div>
        )}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <div>
          <label className="eyebrow text-muted-foreground text-[0.55rem] mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
        </div>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
            <input type="checkbox" className="accent-foreground" defaultChecked /> Remember me
          </label>
          <a href="/forgot-password" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-foreground/[0.03] p-3 text-[0.7rem] text-muted-foreground">
        <div className="font-medium text-foreground mb-1">Demo customer</div>
        customer@lumen.store · Customer#2024
      </div>
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
