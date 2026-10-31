"use client";

import { useEffect, useState } from "react";
import { Loader2, Store, CreditCard, Truck, ShieldCheck, Check } from "lucide-react";
import { COD_ENABLED } from "@/lib/payment";

export default function AdminSettings() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Settings</h1>
        <p className="text-sm text-white/40 mt-1">Store configuration and policies.</p>
      </div>

      <Section icon={<Store className="h-4 w-4" />} title="Store">
        <Row label="Brand" value="LUMEN — Objects of Quiet Luxury" />
        <Row label="Catalog size" value={`${stats.totalProducts} products`} />
        <Row label="Categories" value="5 (Electronics, Fashion, Sneakers, Accessories, Lifestyle)" />
        <Row label="Currency" value="INR (₹)" />
      </Section>

      <Section icon={<CreditCard className="h-4 w-4" />} title="Payments">
        <Row label="Razorpay" value={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "Configured (test mode)" : "Not configured — add keys to .env"} status={!!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID} />
        <Row label="Cash on Delivery" value={COD_ENABLED ? "Enabled" : "Disabled"} status={COD_ENABLED} />
        <p className="text-xs text-white/40 mt-2">
          To enable online payments, add <code className="font-mono text-white/60">RAZORPAY_KEY_ID</code>, <code className="font-mono text-white/60">RAZORPAY_KEY_SECRET</code> and <code className="font-mono text-white/60">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> to your <code className="font-mono text-white/60">.env</code>. Use test keys (starting <code className="font-mono text-white/60">rzp_test_</code>).
        </p>
      </Section>

      <Section icon={<Truck className="h-4 w-4" />} title="Shipping & returns">
        <Row label="Shipping" value="Complimentary on all orders" status />
        <Row label="Returns window" value="30 days, no questions" status />
        <Row label="Repair promise" value="10 years" status />
      </Section>

      <Section icon={<ShieldCheck className="h-4 w-4" />} title="Security">
        <Row label="Authentication" value="NextAuth credentials + JWT sessions" status />
        <Row label="Admin access" value="Role-based (ADMIN), enforced in middleware + API" status />
        <Row label="Payments" value="Server-side signature verification" status />
        <Row label="Price integrity" value="Server-calculated, never trusted from client" status />
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-electric">{icon}</span>
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value, status }: { label: string; value: string; status?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/50">{label}</span>
      <span className="flex items-center gap-2 text-white/80 text-right">
        {value}
        {status !== undefined && (status ? <Check className="h-3.5 w-3.5 text-green-400" /> : <span className="h-2 w-2 rounded-full bg-amber-400" />)}
      </span>
    </div>
  );
}
