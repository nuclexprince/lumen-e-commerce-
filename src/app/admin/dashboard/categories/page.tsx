"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", tagline: "", description: "", image: "", span: "regular" });

  const load = () => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCats(d.categories || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const add = async () => {
    if (!form.name || !form.slug) { toast.error("Name and slug required"); return; }
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: slugify(form.slug), image: form.image || "/categories/lifestyle.png" }),
    });
    const data = await res.json();
    if (res.ok) { toast.success("Category created"); setAdding(false); setForm({ name: "", slug: "", tagline: "", description: "", image: "", span: "regular" }); load(); }
    else toast.error(data.error || "Failed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Categories</h1>
          <p className="text-sm text-white/40 mt-1">{cats.length} categories</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-cream text-charcoal px-4 h-10 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <div key={c.id} className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5">
              <div className="aspect-[3/2] overflow-hidden bg-white/5">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="font-display text-lg">{c.name}</div>
                <div className="text-xs text-white/40">{c.tagline}</div>
                <div className="text-[0.65rem] text-white/30 mt-1">/{c.slug} · {c.span}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAdding(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#15161a] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between"><h2 className="font-display text-lg">New category</h2><button onClick={() => setAdding(false)} className="text-white/40 hover:text-cream"><X className="h-4 w-4" /></button></div>
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: slugify(v) })} />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: slugify(v) })} />
            <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
            <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            <Field label="Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            <label className="block">
              <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">Grid span</span>
              <select value={form.span} onChange={(e) => setForm({ ...form, span: e.target.value })} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none">
                <option value="regular" className="bg-[#15161a]">Regular</option>
                <option value="tall" className="bg-[#15161a]">Tall</option>
                <option value="wide" className="bg-[#15161a]">Wide</option>
              </select>
            </label>
            <button onClick={add} className="w-full h-11 rounded-full bg-cream text-charcoal text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90"><Check className="h-4 w-4" /> Create</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40" />
    </label>
  );
}
