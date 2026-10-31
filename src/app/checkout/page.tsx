"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Lock,
  Tag,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useShop } from "@/lib/store";
import { useCatalog } from "@/components/catalog-provider";
import { StorefrontChrome } from "@/components/site/storefront-chrome";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
}
interface DeliveryInfo {
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string;
}

export default function CheckoutPage() {
  return (
    <StorefrontChrome>
      <CheckoutInner />
    </StorefrontChrome>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, subtotal, clearCart } = useShop();
  const { products } = useCatalog();

  const [step, setStep] = useState<Step>(1);
  const [contact, setContact] = useState<ContactInfo>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    instructions: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);
  const [razorpayConfigured, setRazorpayConfigured] = useState(true);

  const sub = subtotal();
  const shipping = 0;
  const discount = coupon?.discount ?? 0;
  const total = sub + shipping - discount;

  // prefill from session + default address
  useEffect(() => {
    if (session?.user) {
      setContact((c) => ({
        ...c,
        fullName: c.fullName || (session.user.name || ""),
        email: c.email || (session.user.email || ""),
      }));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/addresses")
        .then((r) => r.json())
        .then((d) => {
          const def = d.addresses?.find((a: any) => a.isDefault) || d.addresses?.[0];
          if (def) {
            setDelivery((dl) => ({
              ...dl,
              address: dl.address || def.address,
              apartment: dl.apartment || def.apartment || "",
              city: dl.city || def.city,
              state: dl.state || def.state,
              pincode: dl.pincode || def.pincode,
            }));
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // empty cart guard
  useEffect(() => {
    if (cart.length === 0 && !placing) {
      // allow a moment for hydration
      const t = setTimeout(() => {
        if (cart.length === 0) router.push("/");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [cart.length, placing, router]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: sub }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.code, discount: data.discount });
        toast.success(`Coupon applied — ${formatINR(data.discount)} off`);
      } else {
        setCoupon(null);
        toast.error(data.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const validateStep = (s: Step): boolean => {
    if (s === 1) {
      if (!contact.fullName.trim()) return toast.error("Full name is required"), false;
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) return toast.error("Valid email required"), false;
      if (!contact.phone.trim() || contact.phone.replace(/\D/g, "").length < 10)
        return toast.error("Valid phone number required"), false;
    }
    if (s === 2) {
      if (!delivery.address.trim()) return toast.error("Address is required"), false;
      if (!delivery.city.trim()) return toast.error("City is required"), false;
      if (!delivery.state.trim()) return toast.error("State is required"), false;
      if (!/^\d{6}$/.test(delivery.pincode)) return toast.error("Valid 6-digit pincode required"), false;
    }
    return true;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(4, (s + 1) as Step));
  };
  const back = () => setStep((s) => Math.max(1, (s - 1) as Step));

  const items = cart.map((l) => ({ productId: l.productId, quantity: l.quantity, size: l.size, color: l.color }));

  // Razorpay flow
  const payWithRazorpay = async () => {
    setPlacing(true);
    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || createData.configured === false) {
        setRazorpayConfigured(false);
        toast.error("Razorpay not configured", {
          description: "Add test keys to .env or pay with Cash on Delivery.",
        });
        setPlacing(false);
        return;
      }
      // load checkout.js
      await loadRazorpayScript();
      const rzp = (window as any).Razorpay;
      if (!rzp) {
        toast.error("Failed to load payment gateway");
        setPlacing(false);
        return;
      }
      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "LUMEN",
        description: "Objects of Quiet Luxury",
        order_id: createData.razorpayOrderId,
        prefill: { name: contact.fullName, email: contact.email, contact: contact.phone },
        theme: { color: "#1a1a1e" },
        handler: async (response: any) => {
          // verify on server
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items,
              contact,
              delivery,
              coupon,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.orderNumber) {
            clearCart();
            router.push(`/checkout/success?order=${verifyData.orderNumber}`);
          } else {
            router.push(`/checkout/failure?reason=${encodeURIComponent(verifyData.error || "verification_failed")}`);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast("Payment cancelled", { description: "No charge was made." });
          },
        },
      };
      const rzpInstance = new rzp(options);
      rzpInstance.on("payment.failed", (resp: any) => {
        setPlacing(false);
        router.push(`/checkout/failure?reason=${encodeURIComponent(resp?.error?.description || "payment_failed")}`);
      });
      rzpInstance.open();
    } catch (e: any) {
      setPlacing(false);
      toast.error("Checkout failed", { description: e?.message });
    }
  };

  const payWithCOD = async () => {
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout/place-cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, contact, delivery, coupon }),
      });
      const data = await res.json();
      if (res.ok && data.orderNumber) {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
      } else {
        toast.error(data.error || "Failed to place order");
        setPlacing(false);
      }
    } catch (e: any) {
      setPlacing(false);
      toast.error("Checkout failed", { description: e?.message });
    }
  };

  const pay = () => {
    if (paymentMethod === "cod") payWithCOD();
    else payWithRazorpay();
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 min-h-[60vh] grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">Your bag is empty</h1>
          <p className="text-sm text-muted-foreground mt-3">Add something worth keeping first.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-full bg-foreground text-background px-5 h-10 text-sm font-medium"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow text-muted-foreground mb-2">Secure Checkout</div>
          <h1 className="font-display text-[2rem] sm:text-[3rem] leading-[0.98]">Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 sm:gap-2 mb-10 overflow-x-auto no-scrollbar">
          {[
            { n: 1, label: "Contact" },
            { n: 2, label: "Delivery" },
            { n: 3, label: "Review" },
            { n: 4, label: "Payment" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
                step === s.n ? "bg-foreground text-background" : step > s.n ? "text-foreground" : "text-muted-foreground"
              )}>
                <span className={cn(
                  "h-5 w-5 rounded-full grid place-items-center text-[0.65rem] font-semibold",
                  step === s.n ? "bg-background text-foreground" : step > s.n ? "bg-foreground text-background" : "bg-foreground/10"
                )}>
                  {step > s.n ? <Check className="h-3 w-3" /> : s.n}
                </span>
                <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
          {/* Steps */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <StepCard title="Contact information" icon={<CreditCard className="h-4 w-4" />}>
                    {!session?.user && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Checking out as guest. <a href="/login" className="underline underline-offset-4 hover:text-foreground">Sign in</a> for faster checkout and order history.
                      </p>
                    )}
                    <Field label="Full name" value={contact.fullName} onChange={(v) => setContact({ ...contact, fullName: v })} placeholder="Aria Lumen" />
                    <Field label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} placeholder="you@example.com" />
                    <Field label="Phone number" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} placeholder="+91 98765 43210" />
                  </StepCard>
                )}
                {step === 2 && (
                  <StepCard title="Delivery information" icon={<Truck className="h-4 w-4" />}>
                    <Field label="Address" value={delivery.address} onChange={(v) => setDelivery({ ...delivery, address: v })} placeholder="Street address" />
                    <Field label="Apartment / building (optional)" value={delivery.apartment} onChange={(v) => setDelivery({ ...delivery, apartment: v })} placeholder="Apt 4B" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" value={delivery.city} onChange={(v) => setDelivery({ ...delivery, city: v })} placeholder="Bengaluru" />
                      <Field label="State" value={delivery.state} onChange={(v) => setDelivery({ ...delivery, state: v })} placeholder="Karnataka" />
                    </div>
                    <Field label="Pincode" value={delivery.pincode} onChange={(v) => setDelivery({ ...delivery, pincode: v.replace(/\D/g, "").slice(0, 6) })} placeholder="560038" />
                    <Field label="Delivery instructions (optional)" textarea value={delivery.instructions} onChange={(v) => setDelivery({ ...delivery, instructions: v })} placeholder="Leave at the front desk, ring once…" />
                  </StepCard>
                )}
                {step === 3 && (
                  <StepCard title="Order review" icon={<ShieldCheck className="h-4 w-4" />}>
                    <div className="space-y-3 mb-5">
                      {cart.map((l) => (
                        <div key={l.lineId} className="flex items-center gap-3">
                          <div className="h-14 w-12 rounded-lg overflow-hidden bg-secondary ring-1 ring-foreground/5 shrink-0">
                            <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{l.name}</div>
                            <div className="text-[0.7rem] text-muted-foreground">
                              Qty {l.quantity}{l.size ? ` · ${l.size}` : ""}{l.color ? ` · ${l.color}` : ""}
                            </div>
                          </div>
                          <div className="text-sm tabular-nums">{formatINR(l.price * l.quantity)}</div>
                        </div>
                      ))}
                    </div>
                    {/* coupon */}
                    <div className="border-t border-foreground/10 pt-4">
                      <label className="eyebrow text-muted-foreground text-[0.55rem] mb-2 block">Promo code</label>
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="WELCOME10"
                          className="flex-1 h-10 rounded-full border border-foreground/15 px-4 text-sm uppercase outline-none focus:ring-2 focus:ring-electric/40"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="h-10 px-4 rounded-full border border-foreground/15 text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </button>
                      </div>
                      {coupon && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-electric">
                          <Tag className="h-3 w-3" /> {coupon.code} applied — {formatINR(coupon.discount)} off
                        </div>
                      )}
                    </div>
                  </StepCard>
                )}
                {step === 4 && (
                  <StepCard title="Payment" icon={<Lock className="h-4 w-4" />}>
                    <PaymentOption
                      selected={paymentMethod === "razorpay"}
                      onSelect={() => setPaymentMethod("razorpay")}
                      icon={<CreditCard className="h-5 w-5" />}
                      title="Razorpay (UPI / Cards / Netbanking)"
                      desc="Pay securely online. Test mode when keys are configured."
                      badge="Recommended"
                    />
                    {paymentMethod === "razorpay" && !razorpayConfigured && (
                      <div className="ml-12 mb-3 text-xs text-amber-700 bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          Razorpay keys are not configured in <code className="font-mono">.env</code>. Add
                          <code className="font-mono"> RAZORPAY_KEY_ID</code>,
                          <code className="font-mono"> RAZORPAY_KEY_SECRET</code> and
                          <code className="font-mono"> NEXT_PUBLIC_RAZORPAY_KEY_ID</code> to enable online payments,
                          or choose Cash on Delivery below.
                        </span>
                      </div>
                    )}
                    <PaymentOption
                      selected={paymentMethod === "cod"}
                      onSelect={() => setPaymentMethod("cod")}
                      icon={<Banknote className="h-5 w-5" />}
                      title="Cash on Delivery"
                      desc="Pay in cash when your order arrives."
                    />
                  </StepCard>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={back}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Continue shopping
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 h-11 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={pay}
                  disabled={placing}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 h-11 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {placing ? "Processing…" : `Pay ${formatINR(total)}`}
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="glass rounded-2xl p-5">
              <div className="eyebrow text-muted-foreground text-[0.55rem] mb-4">Order Summary</div>
              <div className="space-y-2 text-sm">
                <Row label={`Subtotal (${cart.length} item${cart.length === 1 ? "" : "s"})`} value={formatINR(sub)} />
                <Row label="Shipping" value={<span className="text-electric">Complimentary</span>} />
                {discount > 0 && <Row label={`Discount (${coupon?.code})`} value={<span className="text-electric">−{formatINR(discount)}</span>} />}
              </div>
              <div className="hairline my-4" />
              <div className="flex items-center justify-between">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-lg tabular-nums">{formatINR(total)}</span>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Encrypted & secure · 30-day returns
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(s);
  });
}

function StepCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground text-[0.55rem] mb-1.5 block">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-xl border border-foreground/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-electric/40 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 rounded-full border border-foreground/15 px-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
        />
      )}
    </label>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  desc,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all",
        selected ? "border-foreground bg-foreground/[0.03]" : "border-foreground/15 hover:border-foreground/30"
      )}
    >
      <span className={cn(
        "h-10 w-10 rounded-full grid place-items-center shrink-0",
        selected ? "bg-foreground text-background" : "bg-foreground/5 text-foreground"
      )}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge && <span className="text-[0.55rem] bg-electric/15 text-electric rounded-full px-2 py-0.5 font-medium">{badge}</span>}
        </span>
        <span className="block text-[0.7rem] text-muted-foreground mt-0.5">{desc}</span>
      </span>
      <span className={cn(
        "h-5 w-5 rounded-full border-2 grid place-items-center shrink-0",
        selected ? "border-foreground" : "border-foreground/20"
      )}>
        {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
      </span>
    </button>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
