"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";
import { formatINR } from "@/lib/format";

const PIE_COLORS = ["var(--electric)", "#c9c7c2", "#8a8a8e", "#5b5b5e", "#3b6fe0"];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d)).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>;
  }

  const categoryData = (stats.recentOrders || []).flatMap((o: any) => o.items || []).reduce((acc: any, it: any) => {
    // approximate by name bucket; real category would need product lookup
    acc[it.name] = (acc[it.name] || 0) + it.quantity;
    return acc;
  }, {});
  const topProducts = Object.entries(categoryData).map(([name, qty]) => ({ name, qty })).sort((a: any, b: any) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Analytics</h1>
        <p className="text-sm text-white/40 mt-1">Revenue and product performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Revenue", v: formatINR(stats.revenue) },
          { l: "Orders", v: stats.totalOrders },
          { l: "Avg order value", v: stats.paidOrders ? formatINR(Math.round(stats.revenue / stats.paidOrders)) : "—" },
          { l: "Conversion", v: `${stats.totalCustomers ? ((stats.paidOrders / stats.totalCustomers) * 100).toFixed(0) : 0}%` },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <div className="text-[0.65rem] uppercase tracking-wider text-white/40 mb-2">{k.l}</div>
            <div className="font-display text-xl tabular-nums">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <h2 className="font-display text-lg mb-4">Orders per day (14 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#15161a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" }} />
              <Bar dataKey="orders" fill="var(--electric)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <h2 className="font-display text-lg mb-4">Top products by units sold</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-white/40 py-10 text-center">No sales yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ background: "#15161a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" }} />
                  <Bar dataKey="qty" fill="#c9c7c2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <h2 className="font-display text-lg mb-4">Order status breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: "Pending", value: stats.pendingOrders },
                  { name: "Paid", value: stats.paidOrders },
                  { name: "Other", value: Math.max(0, stats.totalOrders - stats.pendingOrders - stats.paidOrders) },
                ].filter((d) => d.value > 0)} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {[0,1,2].map((i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#15161a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
