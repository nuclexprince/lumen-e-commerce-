"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, X, Check, Power } from "lucide-react";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", minSubtotal: "0", maxDiscount: "", usageLimit: "", expiresAt: "" });

  const load = () => {
    fetch("/api/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.code || !form.value) { toast.error("Code and value required"); return; }
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { toast.success("Coupon created"); setAdding(false); setForm({ code: "", type: "percent", value: "", minSubtotal: "0", maxDiscount: "", usageLimit: "", expiresAt: "" }); load(); }
    else toast.error(data.error || "Failed");
  };

  const toggle = async (c: any) => {
    await fetch("/api/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, active: !c.active }) });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Discounts</h1>
          <p className="text-sm text-white/40 mt-1">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-cream text-charcoal px-4 h-10 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg">{c.code}</div>
                  <div className="text-xs text-white/40">{c.type === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`}</div>
                </div>
                <button onClick={() => toggle(c)} className={cn("h-7 w-7 grid place-items-center rounded-full transition-colors", c.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/40")}>
                  <Power className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-1 text-[0.7rem] text-white/40">
                <div>Min subtotal: {formatINR(c.minSubtotal)}</div>
                {c.maxDiscount && <div>Max discount: {formatINR(c.maxDiscount)}</div>}
                <div>Used {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""} times</div>
                {c.expiresAt && <div>Expires: {new Date(c.expiresAt).toLocaleDateString("en-IN")}</div>}
              </div>
              <div className={cn("mt-3 text-[0.6rem] font-medium rounded-full px-2 py-1 inline-block", c.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/40")}>
                {c.active ? "Active" : "Inactive"}
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAdding(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#15161a] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between"><h2 className="font-display text-lg">New coupon</h2><button onClick={() => setAdding(false)} className="text-white/40 hover:text-cream"><X className="h-4 w-4" /></button></div>
            <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">Type</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none">
                  <option value="percent" className="bg-[#15161a]">Percent</option>
                  <option value="fixed" className="bg-[#15161a]">Fixed amount</option>
                </select>
              </label>
              <Field label="Value" value={form.value} onChange={(v) => setForm({ ...form, value: v })} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min subtotal (₹)" value={form.minSubtotal} onChange={(v) => setForm({ ...form, minSubtotal: v })} type="number" />
              <Field label="Max discount (₹)" value={form.maxDiscount} onChange={(v) => setForm({ ...form, maxDiscount: v })} type="number" />
            </div>
            <Field label="Usage limit (optional)" value={form.usageLimit} onChange={(v) => setForm({ ...form, usageLimit: v })} type="number" />
            <button onClick={add} className="w-full h-11 rounded-full bg-cream text-charcoal text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90"><Check className="h-4 w-4" /> Create coupon</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40" />
    </label>
  );
}
