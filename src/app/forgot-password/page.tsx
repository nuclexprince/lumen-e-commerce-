"use client";

import { useState } from "react";
import { Loader2, ArrowRight, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/site/auth-shell";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    // Demo: simulate sending a reset link. In production, integrate an email service.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent", { description: `Check ${email}` });
  };

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={sent ? "Email sent" : "Password recovery"}
      footer={
        <>
          Remembered it?{" "}
          <a href="/login" className="text-foreground underline underline-offset-4 hover:opacity-70">
            Back to sign in
          </a>
        </>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-electric/10 p-4">
            <MailCheck className="h-5 w-5 text-electric shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">We've sent a reset link to</p>
              <p className="text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground mt-2">
                If you don't see it within a few minutes, check your spam folder.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 text-destructive text-xs px-4 py-3">{error}</div>
          )}
          <p className="text-sm text-muted-foreground">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[0.55rem] mb-1.5 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 rounded-xl border border-foreground/15 px-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
