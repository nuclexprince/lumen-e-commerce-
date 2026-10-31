"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Save, AlertTriangle } from "lucide-react";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const load = () => {
    fetch("/api/products?all=true").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const lowStock = products.filter((p) => p.inventory <= 5);

  const saveOne = async (slug: string) => {
    const val = parseInt(edits[slug]);
    if (isNaN(val)) return;
    const res = await fetch(`/api/products/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventory: val }),
    });
    if (res.ok) {
      toast.success("Inventory updated");
      setProducts((ps) => ps.map((p) => p.slug === slug ? { ...p, inventory: val } : p));
      setEdits((e) => { const c = { ...e }; delete c[slug]; return c; });
    } else toast.error("Update failed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Inventory</h1>
        <p className="text-sm text-white/40 mt-1">{products.length} products · {lowStock.length} low stock</p>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-amber-400">{lowStock.length} products need restocking</div>
            <div className="text-white/50 text-xs mt-0.5">{lowStock.map((p) => p.name).join(", ")}</div>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full h-10 rounded-full bg-white/5 border border-white/10 pl-9 pr-4 text-sm text-cream outline-none focus:ring-2 focus:ring-electric/40 placeholder:text-white/30" />
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
      ) : (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-wider text-white/40 border-b border-white/5">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-8 rounded-lg overflow-hidden bg-white/5 shrink-0"><img src={p.image} alt={p.name} className="h-full w-full object-cover" /></div>
                        <span className="font-medium truncate max-w-44">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/60">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[0.6rem] font-medium rounded-full px-2 py-1", p.inventory === 0 ? "bg-red-500/15 text-red-400" : p.inventory <= 5 ? "bg-amber-500/15 text-amber-400" : "bg-green-500/15 text-green-400")}>
                        {p.inventory === 0 ? "Out" : p.inventory <= 5 ? "Low" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.inventory}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={edits[p.slug] ?? ""}
                          onChange={(e) => setEdits({ ...edits, [p.slug]: e.target.value })}
                          placeholder={String(p.inventory)}
                          className="w-20 h-8 rounded-lg bg-white/5 border border-white/10 px-2 text-xs text-cream outline-none focus:ring-1 focus:ring-electric/40 text-right"
                        />
                        <button onClick={() => saveOne(p.slug)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-white/60 hover:text-cream" aria-label="Save">
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
