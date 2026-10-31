"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Users, Package, Clock, AlertTriangle, ArrowRight,
  Loader2,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: formatINR(stats.revenue), icon: TrendingUp, tint: "text-electric" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, tint: "text-cream", sub: `${stats.paidOrders} paid` },
    { label: "Customers", value: stats.totalCustomers, icon: Users, tint: "text-cream" },
    { label: "Products", value: stats.totalProducts, icon: Package, tint: "text-cream" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, tint: "text-amber-400" },
    { label: "Low Stock", value: stats.lowStockProducts.length, icon: AlertTriangle, tint: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Overview</h1>
        <p className="text-sm text-white/40 mt-1">Store performance at a glance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] uppercase tracking-wider text-white/40">{k.label}</span>
              <k.icon className={cn("h-4 w-4", k.tint)} strokeWidth={1.6} />
            </div>
            <div className="font-display text-2xl tabular-nums">{k.value}</div>
            {k.sub && <div className="text-[0.65rem] text-white/40 mt-1">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg">Revenue</h2>
            <p className="text-xs text-white/40">Last 14 days</p>
          </div>
          <div className="text-right">
            <div className="font-display text-xl tabular-nums text-electric">
              {formatINR(stats.revenueChart.reduce((s: number, d: any) => s + d.revenue, 0))}
            </div>
            <div className="text-[0.65rem] text-white/40">{stats.revenueChart.reduce((s: number, d: any) => s + d.orders, 0)} orders</div>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenueChart}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--electric)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--electric)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip
                contentStyle={{ background: "#15161a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" }}
                formatter={(v: any) => formatINR(v)}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--electric)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Recent orders</h2>
            <Link href="/admin/dashboard/orders" className="text-xs text-white/40 hover:text-cream flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.length === 0 && <p className="text-sm text-white/40 py-6 text-center">No orders yet.</p>}
            {stats.recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-medium tabular-nums">{o.orderNumber}</div>
                  <div className="text-[0.7rem] text-white/40">{o.fullName} · {o.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm tabular-nums">{formatINR(o.total)}</div>
                  <div className="text-[0.65rem] text-white/40">{o.status} · {o.paymentStatus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best sellers */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <h2 className="font-display text-lg mb-4">Best sellers</h2>
          <div className="space-y-2">
            {stats.bestSellers.length === 0 && <p className="text-sm text-white/40 py-6 text-center">No sales data yet.</p>}
            {stats.bestSellers.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/30 tabular-nums w-4">{i + 1}</span>
                <div className="h-9 w-8 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  <img src={p.primaryImage} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[0.7rem] text-white/40">{formatINR(p.price)}</div>
                </div>
                <div className="text-sm tabular-nums text-electric">{p.sold} sold</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock + recent customers */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Inventory alerts</h2>
            <Link href="/admin/dashboard/inventory" className="text-xs text-white/40 hover:text-cream flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.length === 0 && <p className="text-sm text-white/40 py-6 text-center">All products well stocked.</p>}
            {stats.lowStockProducts.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="h-9 w-8 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  <img src={p.primaryImage} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                </div>
                <div className={cn("text-sm tabular-nums", p.inventory === 0 ? "text-destructive" : "text-amber-400")}>
                  {p.inventory} left
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Recent customers</h2>
            <Link href="/admin/dashboard/customers" className="text-xs text-white/40 hover:text-cream flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentCustomers.length === 0 && <p className="text-sm text-white/40 py-6 text-center">No customers yet.</p>}
            {stats.recentCustomers.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-xs font-medium">
                  {c.name?.[0]?.toUpperCase() || "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-[0.7rem] text-white/40 truncate">{c.email}</div>
                </div>
                <div className="text-[0.65rem] text-white/40">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
