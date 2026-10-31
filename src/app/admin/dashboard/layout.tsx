"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Boxes,
  Percent, BarChart3, Settings, LogOut, Menu, X, Loader2, ExternalLink,
} from "lucide-react";
import { BrandMark } from "@/components/site/navbar";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/dashboard/customers", label: "Customers", icon: Users },
  { href: "/admin/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/dashboard/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && (session.user as any).role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-charcoal grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#0e0f12] text-cream flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#15161a] border-r border-white/5 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <BrandMark className="text-cream" />
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/40">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-white/10 text-cream"
                    : "text-white/50 hover:text-cream hover:bg-white/5"
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.6} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-electric" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-cream hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.6} /> View storefront
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} /> Logout
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#15161a] border-b border-white/5 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="text-cream">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm text-white/60">Admin</span>
          <div className="w-5" />
        </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
