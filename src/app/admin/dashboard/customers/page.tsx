"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/format";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Customers</h1>
        <p className="text-sm text-white/40 mt-1">{customers.length} registered customers</p>
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/40">No customers yet.</div>
      ) : (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-wider text-white/40 border-b border-white/5">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">Total spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/10 grid place-items-center text-xs font-medium">{c.name?.[0]?.toUpperCase() || "L"}</div>
                        <div>
                          <div className="font-medium">{c.name || "—"}</div>
                          <div className="text-[0.65rem] text-white/40 flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3 text-right tabular-nums flex items-center justify-end gap-1 text-white/60"><ShoppingBag className="h-3 w-3" /> {c.orderCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-electric">{formatINR(c.totalSpent)}</td>
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
