"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Loader2, Truck, MapPin, Package, CreditCard, Save, Filter,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];
const PAY_STATUSES = ["Pending", "Paid", "Failed", "Refunded", "COD pending"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const load = () => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (statusFilter) qs.set("status", statusFilter);
    if (payFilter) qs.set("paymentStatus", payFilter);
    fetch(`/api/orders?${qs}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, payFilter]);

  const openOrder = (o: any) => {
    fetch(`/api/orders/${o.orderNumber}`)
      .then((r) => r.json())
      .then((d) => setSelected(d.order));
  };

  const updateOrder = async (patch: any) => {
    if (!selected) return;
    const res = await fetch(`/api/orders/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      setSelected(data.order);
      toast.success("Order updated");
      load();
    } else toast.error(data.error || "Update failed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Orders</h1>
        <p className="text-sm text-white/40 mt-1">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search order #, name, email…"
            className="w-full h-10 rounded-full bg-white/5 border border-white/10 pl-9 pr-4 text-sm text-cream outline-none focus:ring-2 focus:ring-electric/40 placeholder:text-white/30"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-full bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none">
          <option value="" className="bg-[#15161a]">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="bg-[#15161a]">{s}</option>)}
        </select>
        <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="h-10 rounded-full bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none">
          <option value="" className="bg-[#15161a]">All payments</option>
          {PAY_STATUSES.map((s) => <option key={s} value={s} className="bg-[#15161a]">{s}</option>)}
        </select>
        <button onClick={load} className="h-10 px-4 rounded-full border border-white/15 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" /> Apply
        </button>
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/40">No orders match your filters.</div>
      ) : (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-wider text-white/40 border-b border-white/5">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} onClick={() => openOrder(o)} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] cursor-pointer">
                    <td className="px-4 py-3 font-medium tabular-nums">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-40">{o.fullName}</div>
                      <div className="text-[0.65rem] text-white/40 truncate max-w-40">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="px-4 py-3"><StatusPill label={o.status} /></td>
                    <td className="px-4 py-3"><span className="text-[0.65rem] text-white/60">{o.paymentStatus}</span></td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDetail order={selected} onClose={() => setSelected(null)} onUpdate={updateOrder} />
    </div>
  );
}

function OrderDetail({ order, onClose, onUpdate }: { order: any | null; onClose: () => void; onUpdate: (patch: any) => void }) {
  if (!order) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.aside
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-[#15161a] border-l border-white/10 flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl tabular-nums">{order.orderNumber}</h2>
              <p className="text-[0.7rem] text-white/40">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
            </div>
            <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 text-white/60"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status controls */}
            <div>
              <SectionLabel icon={<Package className="h-3.5 w-3.5" />} text="Order status" />
              <div className="grid grid-cols-4 gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate({ status: s })}
                    className={cn("rounded-lg border px-2 py-2 text-[0.65rem] font-medium transition-colors", order.status === s ? "border-electric/50 bg-electric/15 text-cream" : "border-white/10 text-white/50 hover:bg-white/5")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment status */}
            <div>
              <SectionLabel icon={<CreditCard className="h-3.5 w-3.5" />} text="Payment status" />
              <div className="grid grid-cols-5 gap-1.5">
                {PAY_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate({ paymentStatus: s })}
                    className={cn("rounded-lg border px-1 py-2 text-[0.6rem] font-medium transition-colors", order.paymentStatus === s ? "border-electric/50 bg-electric/15 text-cream" : "border-white/10 text-white/50 hover:bg-white/5")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking */}
            <div>
              <SectionLabel icon={<Truck className="h-3.5 w-3.5" />} text="Shipment tracking" />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={order.trackingNumber || ""}
                  onChange={(e) => setSelected({ ...order, trackingNumber: e.target.value })}
                  placeholder="Tracking number"
                  className="h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40 placeholder:text-white/25"
                />
                <input
                  value={order.carrier || ""}
                  onChange={(e) => setSelected({ ...order, carrier: e.target.value })}
                  placeholder="Carrier (e.g. DTDC)"
                  className="h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40 placeholder:text-white/25"
                />
              </div>
              <button
                onClick={() => onUpdate({ trackingNumber: order.trackingNumber, carrier: order.carrier })}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 h-9 text-xs hover:bg-white/15 transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Save tracking
              </button>
            </div>

            {/* Customer + delivery */}
            <div>
              <SectionLabel icon={<MapPin className="h-3.5 w-3.5" />} text="Delivery" />
              <div className="rounded-xl bg-white/5 p-4 text-sm space-y-1">
                <div className="font-medium">{order.fullName}</div>
                <div className="text-white/60 text-xs">{order.email} · {order.phone}</div>
                <div className="text-white/60 text-xs pt-1">{order.address}{order.apartment ? `, ${order.apartment}` : ""}</div>
                <div className="text-white/60 text-xs">{order.city}, {order.state} {order.pincode}</div>
                {order.instructions && <div className="text-white/40 text-xs pt-1 italic">“{order.instructions}”</div>}
              </div>
            </div>

            {/* Items */}
            <div>
              <SectionLabel text="Items" />
              <div className="space-y-2">
                {order.items?.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    <div className="h-12 w-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{it.name}</div>
                      <div className="text-[0.65rem] text-white/40">× {it.quantity}{it.size ? ` · ${it.size}` : ""}{it.color ? ` · ${it.color}` : ""}</div>
                    </div>
                    <div className="text-sm tabular-nums">{formatINR(it.price * it.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-white/5 p-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              <Row label="Shipping" value={order.shipping ? formatINR(order.shipping) : "Complimentary"} />
              {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`−${formatINR(order.discount)}`} accent />}
              <div className="hairline my-2 opacity-30" />
              <div className="flex items-center justify-between font-display text-lg">
                <span>Total</span><span className="tabular-nums">{formatINR(order.total)}</span>
              </div>
              {order.payment?.method && <div className="text-[0.65rem] text-white/40 pt-1">Paid via {order.payment.method}</div>}
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function SectionLabel({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-white/40 mb-2">
      {icon} {text}
    </div>
  );
}
function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      <span className={cn("tabular-nums", accent && "text-electric")}>{value}</span>
    </div>
  );
}
function StatusPill({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Pending: "bg-amber-500/15 text-amber-400",
    Confirmed: "bg-electric/15 text-electric",
    Processing: "bg-electric/15 text-electric",
    Shipped: "bg-blue-500/15 text-blue-400",
    Delivered: "bg-green-500/15 text-green-400",
    Cancelled: "bg-red-500/15 text-red-400",
    Refunded: "bg-red-500/15 text-red-400",
  };
  return <span className={cn("text-[0.6rem] font-medium rounded-full px-2 py-1", colors[label] || "bg-white/10 text-white/60")}>{label}</span>;
}
