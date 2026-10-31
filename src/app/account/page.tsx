"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package, MapPin, User, LogOut, Plus, Trash2, Loader2, Check,
  Truck, Clock, CreditCard,
} from "lucide-react";
import { StorefrontChrome } from "@/components/site/storefront-chrome";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "orders" | "addresses" | "profile";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/account");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/addresses").then((r) => r.json()),
    ])
      .then(([o, a]) => {
        setOrders(o.orders || []);
        setAddresses(a.addresses || []);
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || !session) {
    return (
      <StorefrontChrome>
        <div className="pt-32 min-h-[60vh] grid place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </StorefrontChrome>
    );
  }

  return (
    <StorefrontChrome>
      <div className="pt-24 sm:pt-28 pb-24 min-h-screen">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8">
            <div className="eyebrow text-muted-foreground mb-2">Your Account</div>
            <h1 className="font-display text-[2rem] sm:text-[3rem] leading-[0.98]">
              Hello, {session.user?.name?.split(" ")[0] || "there"}.
            </h1>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-28 h-fit">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
                <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={<Package className="h-4 w-4" />} label="Orders" />
                <TabButton active={tab === "addresses"} onClick={() => setTab("addresses")} icon={<MapPin className="h-4 w-4" />} label="Addresses" />
                <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={<User className="h-4 w-4" />} label="Profile" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors w-fit"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </nav>
            </aside>

            {/* Content */}
            <div className="min-w-0">
              {loading ? (
                <div className="py-20 grid place-items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {tab === "orders" && <OrdersTab orders={orders} />}
                  {tab === "addresses" && <AddressesTab addresses={addresses} setAddresses={setAddresses} />}
                  {tab === "profile" && <ProfileTab session={session} />}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StorefrontChrome>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors w-fit shrink-0",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
      )}
    >
      {icon} {label}
    </button>
  );
}

function OrdersTab({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-7 w-7" />}
        title="No orders yet"
        desc="When you place your first order, it'll appear here."
      />
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-foreground/10 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-foreground/[0.02]">
            <div>
              <div className="text-sm font-medium tabular-nums">{o.orderNumber}</div>
              <div className="text-[0.7rem] text-muted-foreground">
                {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill label={o.status} />
              <PaymentPill label={o.paymentStatus} />
            </div>
            <div className="font-display text-lg tabular-nums">{formatINR(o.total)}</div>
          </div>
          <div className="p-4 sm:p-5 flex flex-wrap items-center gap-3">
            {o.items?.slice(0, 4).map((it: any) => (
              <div key={it.id} className="flex items-center gap-2">
                <div className="h-10 w-9 rounded-lg overflow-hidden bg-secondary ring-1 ring-foreground/5">
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                </div>
                <div className="text-xs">
                  <div className="font-medium truncate max-w-28">{it.name}</div>
                  <div className="text-muted-foreground">× {it.quantity}</div>
                </div>
              </div>
            ))}
            {o.items?.length > 4 && (
              <span className="text-xs text-muted-foreground">+{o.items.length - 4} more</span>
            )}
            {o.trackingNumber && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-electric">
                <Truck className="h-3.5 w-3.5" /> {o.carrier}: {o.trackingNumber}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({ addresses, setAddresses }: { addresses: any[]; setAddresses: (a: any[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "Home", fullName: "", phone: "", address: "", apartment: "", city: "", state: "", pincode: "" });

  const add = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please complete the address");
      return;
    }
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setAddresses([data.address, ...addresses]);
      setAdding(false);
      setForm({ label: "Home", fullName: "", phone: "", address: "", apartment: "", city: "", state: "", pincode: "" });
      toast.success("Address saved");
    } else {
      toast.error(data.error || "Failed to save");
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    setAddresses(addresses.filter((a) => a.id !== id));
    toast("Address removed");
  };

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !adding && (
        <EmptyState icon={<MapPin className="h-7 w-7" />} title="No saved addresses" desc="Add an address for faster checkout." />
      )}
      {addresses.map((a) => (
        <div key={a.id} className="rounded-2xl border border-foreground/10 p-4 sm:p-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{a.label}</span>
              {a.isDefault && <span className="text-[0.55rem] bg-electric/15 text-electric rounded-full px-2 py-0.5 font-medium">Default</span>}
            </div>
            <p className="text-sm text-muted-foreground">{a.fullName} · {a.phone}</p>
            <p className="text-sm text-muted-foreground mt-1">{a.address}{a.apartment ? `, ${a.apartment}` : ""}, {a.city}, {a.state} {a.pincode}</p>
          </div>
          <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove address">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="rounded-2xl border border-foreground/15 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
            <Input label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
          </div>
          <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="h-10 px-4 rounded-full border border-foreground/15 text-sm hover:bg-foreground/5 transition-colors">Cancel</button>
            <button onClick={add} className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">Save address</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border border-dashed border-foreground/20 p-5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add new address
        </button>
      )}
    </div>
  );
}

function ProfileTab({ session }: { session: any }) {
  return (
    <div className="rounded-2xl border border-foreground/10 p-5 sm:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-foreground text-background grid place-items-center font-display text-xl">
          {session.user?.name?.[0]?.toUpperCase() || "L"}
        </div>
        <div>
          <div className="font-display text-xl">{session.user?.name}</div>
          <div className="text-sm text-muted-foreground">{session.user?.email}</div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-y-4 text-sm">
        <dt className="text-muted-foreground">Account type</dt>
        <dd className="text-right capitalize">{(session.user as any).role?.toLowerCase()}</dd>
        <dt className="text-muted-foreground">Member since</dt>
        <dd className="text-right">2024</dd>
        <dt className="text-muted-foreground">Loyalty status</dt>
        <dd className="text-right text-electric">Quiet Member</dd>
      </dl>
      <div className="hairline my-6" />
      <div className="rounded-xl bg-foreground/[0.03] p-4 text-xs text-muted-foreground">
        Profile editing is managed through your account settings. To update your name or password, contact LUMEN care.
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 p-10 text-center">
      <div className="h-14 w-14 rounded-full bg-foreground/5 grid place-items-center mx-auto mb-4 text-muted-foreground">{icon}</div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{desc}</p>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground text-[0.55rem] mb-1.5 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-foreground/15 px-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
      />
    </label>
  );
}

function StatusPill({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Confirmed: "bg-electric/15 text-electric",
    Processing: "bg-electric/15 text-electric",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-destructive/10 text-destructive",
    Refunded: "bg-destructive/10 text-destructive",
  };
  return <span className={cn("text-[0.6rem] font-medium rounded-full px-2 py-1", colors[label] || "bg-foreground/10 text-muted-foreground")}>{label}</span>;
}

function PaymentPill({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Paid: "text-green-600",
    Pending: "text-amber-600",
    Failed: "text-destructive",
    Refunded: "text-destructive",
    "COD pending": "text-amber-600",
  };
  return (
    <span className={cn("text-[0.6rem] font-medium flex items-center gap-1", colors[label] || "text-muted-foreground")}>
      <CreditCard className="h-3 w-3" /> {label}
    </span>
  );
}
