"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, X, Loader2, Upload, Star, Eye, EyeOff,
  Check, Image as ImageIcon,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMPTY = {
  name: "", slug: "", shortDescription: "", description: "", price: "",
  compareAtPrice: "", categorySlug: "", primaryImage: "", badge: "",
  collection: "", tags: "", sizes: "One Size", colors: "",
  inventory: "0", featured: false, trending: false, isNew: false,
  editorsPick: false, published: true, gallery: [] as string[],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/products?all=true").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setProducts(p.products || []);
        setCategories(c.categories || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(q.toLowerCase())
  );

  const openNew = () => { setEditing({ ...EMPTY }); setCreating(true); };
  const openEdit = (p: any) => {
    setEditing({
      ...EMPTY,
      ...p,
      price: String(p.price),
      compareAtPrice: p.originalPrice ? String(p.originalPrice) : "",
      categorySlug: p.category,
      inventory: String(p.inventory),
      colors: p.colors.map((c: any) => `${c.name}:${c.hex}`).join(","),
      tags: p.tags.join(","),
      sizes: p.sizes.join(","),
      gallery: p.gallery.length > 1 ? p.gallery.slice(1) : [],
    });
    setCreating(false);
  };

  const close = () => { setEditing(null); setCreating(false); };

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.slug || !editing.price || !editing.categorySlug || !editing.primaryImage) {
      toast.error("Name, slug, price, category and image are required");
      return;
    }
    const body = {
      ...editing,
      price: parseInt(editing.price) || 0,
      compareAtPrice: editing.compareAtPrice ? parseInt(editing.compareAtPrice) : null,
      inventory: parseInt(editing.inventory) || 0,
      colors: editing.colors.split(",").map((c: string) => c.trim()).filter(Boolean).map((c) => {
        const [name, hex] = c.split(":");
        return { name: name?.trim(), hex: (hex?.trim() || "#2b2b2e") };
      }),
    };
    const method = creating ? "POST" : "PUT";
    const url = creating ? "/api/products" : `/api/products/${editing.slug}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(creating ? "Product created" : "Product updated");
      close();
      load();
    } else {
      toast.error(data.error || "Save failed");
    }
  };

  const remove = async (p: any) => {
    if (!confirm(`Delete "${p.name}"? This unpublishes it if it has been ordered.`)) return;
    const res = await fetch(`/api/products/${p.slug}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.softDeleted ? "Unpublished (had orders)" : "Product deleted");
      load();
    } else toast.error(data.error || "Delete failed");
  };

  const togglePublish = async (p: any) => {
    const res = await fetch(`/api/products/${p.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    if (res.ok) {
      toast.success(p.published ? "Unpublished" : "Published");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Products</h1>
          <p className="text-sm text-white/40 mt-1">{products.length} products · changes reflect instantly on the storefront</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-cream text-charcoal px-4 h-10 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full h-10 rounded-full bg-white/5 border border-white/10 pl-9 pr-4 text-sm text-cream outline-none focus:ring-2 focus:ring-electric/40 placeholder:text-white/30"
        />
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
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-9 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-40">{p.name}</div>
                          <div className="text-[0.65rem] text-white/40 truncate max-w-40">{p.shortDescription}</div>
                        </div>
                        {p.editorsPick && <Star className="h-3 w-3 text-electric fill-electric" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{p.categoryName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatINR(p.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={cn(p.inventory === 0 ? "text-destructive" : p.inventory <= 5 ? "text-amber-400" : "text-white/60")}>
                        {p.inventory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePublish(p)} className={cn(
                        "text-[0.6rem] font-medium rounded-full px-2 py-1 flex items-center gap-1 transition-colors",
                        p.published ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/40"
                      )}>
                        {p.published ? <><Eye className="h-2.5 w-2.5" /> Published</> : <><EyeOff className="h-2.5 w-2.5" /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-white/60 hover:text-cream transition-colors" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(p)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-white/60 hover:text-destructive transition-colors" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-white/40">No products found.</p>}
        </div>
      )}

      <ProductEditor
        product={editing}
        creating={creating}
        categories={categories}
        onClose={close}
        onSave={save}
        onChange={(patch) => setEditing((e: any) => ({ ...e, ...patch }))}
      />
    </div>
  );
}

function ProductEditor({
  product, creating, categories, onClose, onSave, onChange,
}: {
  product: any | null;
  creating: boolean;
  categories: any[];
  onClose: () => void;
  onSave: () => void;
  onChange: (patch: any) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        onChange({ primaryImage: data.url });
        toast.success("Image uploaded");
      } else toast.error(data.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return (
    <AnimatePresence>
      {product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-[#15161a] border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="font-display text-xl">{creating ? "New product" : "Edit product"}</h2>
              <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 text-white/60"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Image upload */}
              <div>
                <Label>Primary image</Label>
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {product.primaryImage ? (
                      <img src={product.primaryImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full grid place-items-center text-white/20"><ImageIcon className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 h-9 text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {uploading ? "Uploading…" : "Upload image"}
                    </button>
                    <input
                      value={product.primaryImage}
                      onChange={(e) => onChange({ primaryImage: e.target.value })}
                      placeholder="or paste an image URL"
                      className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-cream outline-none focus:ring-1 focus:ring-electric/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextField label="Name" value={product.name} onChange={(v) => onChange({ name: v, slug: creating ? slugify(v) : product.slug })} />
                <TextField label="Slug" value={product.slug} onChange={(v) => onChange({ slug: slugify(v) })} />
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={product.categorySlug}
                  onChange={(e) => onChange({ categorySlug: e.target.value })}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40"
                >
                  <option value="" className="bg-[#15161a]">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.slug} className="bg-[#15161a]">{c.name}</option>)}
                </select>
              </div>

              <TextField label="Short description" value={product.shortDescription} onChange={(v) => onChange({ shortDescription: v })} />
              <TextArea label="Full description" value={product.description} onChange={(v) => onChange({ description: v })} />

              <div className="grid grid-cols-3 gap-3">
                <TextField label="Price (₹)" value={product.price} onChange={(v) => onChange({ price: v })} type="number" />
                <TextField label="Compare at (₹)" value={product.compareAtPrice} onChange={(v) => onChange({ compareAtPrice: v })} type="number" />
                <TextField label="Inventory" value={product.inventory} onChange={(v) => onChange({ inventory: v })} type="number" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Badge</Label>
                  <select value={product.badge} onChange={(e) => onChange({ badge: e.target.value })} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none">
                    <option value="" className="bg-[#15161a]">None</option>
                    <option value="New" className="bg-[#15161a]">New</option>
                    <option value="Trending" className="bg-[#15161a]">Trending</option>
                    <option value="Editor's Pick" className="bg-[#15161a]">Editor's Pick</option>
                    <option value="Limited" className="bg-[#15161a]">Limited</option>
                  </select>
                </div>
                <div>
                  <Label>Collection</Label>
                  <select value={product.collection} onChange={(e) => onChange({ collection: e.target.value })} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none">
                    <option value="" className="bg-[#15161a]">None</option>
                    <option value="trending" className="bg-[#15161a]">Trending</option>
                    <option value="new" className="bg-[#15161a]">New Arrivals</option>
                    <option value="editors" className="bg-[#15161a]">Editor's Picks</option>
                  </select>
                </div>
              </div>

              <TextField label="Tags (comma separated)" value={product.tags} onChange={(v) => onChange({ tags: v })} placeholder="audio, minimal, charcoal" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Sizes (comma separated)" value={product.sizes} onChange={(v) => onChange({ sizes: v })} />
                <TextField label="Colours (name:hex, comma separated)" value={product.colors} onChange={(v) => onChange({ colors: v })} placeholder="Charcoal:#2b2b2e,Silver:#c9c7c2" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Toggle label="Featured" checked={product.featured} onChange={(v) => onChange({ featured: v })} />
                <Toggle label="Trending" checked={product.trending} onChange={(v) => onChange({ trending: v })} />
                <Toggle label="New arrival" checked={product.isNew} onChange={(v) => onChange({ isNew: v })} />
                <Toggle label="Editor's pick" checked={product.editorsPick} onChange={(v) => onChange({ editorsPick: v })} />
                <Toggle label="Published" checked={product.published} onChange={(v) => onChange({ published: v })} />
              </div>
            </div>

            <div className="border-t border-white/10 p-4 flex gap-2">
              <button onClick={onClose} className="flex-1 h-11 rounded-full border border-white/15 text-sm hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={onSave} className="flex-1 h-11 rounded-full bg-cream text-charcoal text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> {creating ? "Create product" : "Save changes"}
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow text-white/40 text-[0.55rem] mb-1.5 block">{children}</span>;
}
function TextField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40 placeholder:text-white/25" />
    </label>
  );
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-cream outline-none focus:ring-1 focus:ring-electric/40 resize-none" />
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn("flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs transition-colors", checked ? "border-electric/40 bg-electric/10 text-cream" : "border-white/10 text-white/50 hover:bg-white/5")}>
      {label}
      <span className={cn("h-4 w-7 rounded-full p-0.5 transition-colors", checked ? "bg-electric" : "bg-white/15")}>
        <span className={cn("block h-3 w-3 rounded-full bg-cream transition-transform", checked && "translate-x-3")} />
      </span>
    </button>
  );
}
