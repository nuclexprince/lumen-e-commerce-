import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding LUMEN database...");

  // --- Users ---
  const adminPass = await bcrypt.hash("AdminLumen#2024", 10);
  const customerPass = await bcrypt.hash("Customer#2024", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@lumen.store" },
    update: { passwordHash: adminPass, role: "ADMIN", name: "LUMEN Admin" },
    create: {
      email: "admin@lumen.store",
      name: "LUMEN Admin",
      passwordHash: adminPass,
      role: "ADMIN",
    },
  });

  const customer = await db.user.upsert({
    where: { email: "customer@lumen.store" },
    update: { passwordHash: customerPass, name: "Aria Lumen" },
    create: {
      email: "customer@lumen.store",
      name: "Aria Lumen",
      passwordHash: customerPass,
      role: "CUSTOMER",
    },
  });

  // address for test customer
  await db.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: customer.id,
      label: "Home",
      fullName: "Aria Lumen",
      phone: "+91 98765 43210",
      address: "12 Cypress Lane, Indiranagar",
      apartment: "Apt 4B",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      isDefault: true,
    },
  });

  console.log(`  ✓ users: admin=${admin.email}, customer=${customer.email}`);

  // --- Categories ---
  const cats = [
    { slug: "electronics", name: "Electronics", tagline: "Engineered quietude", description: "Objects that think softly. Audio, wearables and ambient tech sculpted for the senses.", image: "/categories/electronics.png", span: "tall" },
    { slug: "fashion", name: "Fashion", tagline: "Drape & form", description: "Tailored essentials in considered materials. Quiet silhouettes made to outlast the season.", image: "/categories/fashion.png", span: "wide" },
    { slug: "sneakers", name: "Sneakers", tagline: "Forward motion", description: "Footwear engineered for movement and presence. Knit, leather, sculpted sole.", image: "/categories/sneakers.png", span: "regular" },
    { slug: "accessories", name: "Accessories", tagline: "The finishing note", description: "Leather, light and metal — the small objects that complete a life well arranged.", image: "/categories/accessories.png", span: "regular" },
    { slug: "lifestyle", name: "Lifestyle", tagline: "The everyday ritual", description: "Ceramic, light and warmth. Objects that turn routine into ritual.", image: "/categories/lifestyle.png", span: "wide" },
  ];
  for (const c of cats) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`  ✓ ${cats.length} categories`);

  // --- Products ---
  type SeedP = {
    slug: string; name: string; cat: string; short: string; desc: string;
    price: number; compareAt?: number; image: string; badge?: string; collection?: string;
    colors: { name: string; hex: string }[]; rating: number; reviews: number; inv: number;
  };
  const seedProducts: SeedP[] = [
    { slug: "aurora-pro", name: "Aurora Pro", cat: "electronics", short: "Adaptive noise-cancelling earbuds in frosted glass.", desc: "Aurora Pro reimagines personal audio as an object of design. Hand-finished frosted glass meets a titanium-accented driver tuned for spatial clarity. Adaptive silence that learns the room you're in.", price: 18900, compareAt: 22500, image: "/products/aurora-earbuds.png", badge: "Trending", collection: "trending", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Silver", hex: "#c9c7c2" }], rating: 4.8, reviews: 312, inv: 24 },
    { slug: "halo-orb", name: "Halo Orb", cat: "electronics", short: "Sculptural ambient speaker with a breathing light ring.", desc: "Halo Orb is a 360° ambient speaker wrapped in matte charcoal ceramic. A ring of soft light pulses with the music, turning listening into a visual ritual.", price: 34900, image: "/products/halo-speaker.png", badge: "Editor's Pick", collection: "editors", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Off-white", hex: "#f2efe8" }], rating: 4.9, reviews: 148, inv: 12 },
    { slug: "pulse-field", name: "Pulse Field", cat: "electronics", short: "Sapphire-face smartwatch with a woven charcoal band.", desc: "Pulse Field pairs a sapphire glass face with a woven charcoal band. Onboard health sensing, a 14-day battery and an interface that disappears until you need it.", price: 41500, image: "/products/pulse-watch.png", badge: "New", collection: "new", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Electric", hex: "#3b6fe0" }], rating: 4.7, reviews: 96, inv: 18 },
    { slug: "eclipse-overcoat", name: "Eclipse Overcoat", cat: "fashion", short: "Tailored charcoal wool overcoat, double-faced.", desc: "The Eclipse is cut from double-faced Italian wool with a relaxed, architectural drape. No lining, no fuss — just a coat that falls exactly where it should.", price: 68900, compareAt: 79000, image: "/products/eclipse-coat.png", badge: "Editor's Pick", collection: "editors", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Stone", hex: "#9b958a" }], rating: 4.9, reviews: 64, inv: 6 },
    { slug: "nimbus-cashmere", name: "Nimbus Cashmere", cat: "fashion", short: "Featherweight cashmere scarf in soft silver grey.", desc: "Spun from grade-A Mongolian cashmere, Nimbus is a featherweight scarf that drapes like smoke and warms like wool should.", price: 12400, image: "/products/nimbus-scarf.png", badge: "New", collection: "new", colors: [{ name: "Silver", hex: "#c9c7c2" }, { name: "Charcoal", hex: "#2b2b2e" }], rating: 4.8, reviews: 87, inv: 30 },
    { slug: "velocity-runner", name: "Velocity Runner", cat: "sneakers", short: "Knit-upper runner with an electric-blue sole.", desc: "Velocity Runner pairs a recycled knit upper with a sculpted, energy-returning sole. A single line of electric blue traces the arc of every step.", price: 16900, compareAt: 19500, image: "/products/velocity-runner.png", badge: "Trending", collection: "trending", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Electric", hex: "#3b6fe0" }], rating: 4.7, reviews: 204, inv: 22 },
    { slug: "drift-minimal", name: "Drift Minimal", cat: "sneakers", short: "Minimalist leather sneaker in warm off-white.", desc: "Drift Minimal is a single-piece leather sneaker on a clean cup-sole. No logos, no noise — just considered proportion and a sole that wears in, not out.", price: 14200, image: "/products/drift-sneaker.png", badge: "New", collection: "new", colors: [{ name: "Off-white", hex: "#f2efe8" }, { name: "Stone", hex: "#9b958a" }], rating: 4.8, reviews: 158, inv: 3 },
    { slug: "solace-tote", name: "Solace Tote", cat: "accessories", short: "Structured leather tote in warm taupe.", desc: "Solace is a full-grain leather tote with a single magnetic closure and a hidden laptop sleeve. Vegetable-tanned, hand-finished, built to age well.", price: 28900, image: "/products/solace-tote.png", badge: "Editor's Pick", collection: "editors", colors: [{ name: "Taupe", hex: "#9b8b73" }, { name: "Charcoal", hex: "#2b2b2e" }], rating: 4.9, reviews: 73, inv: 14 },
    { slug: "ember-optics", name: "Ember Optics", cat: "accessories", short: "Sculptural sunglasses with thin silver frames.", desc: "Ember Optics is a hand-polished frame in surgical-grade steel with subtly tinted, polarised lenses. UV400 protection in a silhouette that suits every face.", price: 9800, image: "/products/ember-sunglasses.png", badge: "Trending", collection: "trending", colors: [{ name: "Silver", hex: "#c9c7c2" }, { name: "Charcoal", hex: "#2b2b2e" }], rating: 4.6, reviews: 119, inv: 40 },
    { slug: "lumen-vessel-lamp", name: "Lumen Vessel Lamp", cat: "lifestyle", short: "Ceramic table lamp with a soft glowing diffuser.", desc: "Lumen Vessel is a slip-cast ceramic lamp with a hand-glazed exterior and a softly diffused inner light. A warm, breathing presence for the table.", price: 15600, image: "/products/lumen-lamp.png", badge: "Editor's Pick", collection: "editors", colors: [{ name: "Off-white", hex: "#f2efe8" }, { name: "Charcoal", hex: "#2b2b2e" }], rating: 4.9, reviews: 52, inv: 9 },
    { slug: "verve-pour-over", name: "Verve Pour-Over", cat: "lifestyle", short: "Matte ceramic carafe with a glass pour-over server.", desc: "Verve is a pour-over ritual in two materials — matte black ceramic for warmth, borosilicate glass for clarity. A brushed steel tray grounds the set.", price: 8900, compareAt: 10500, image: "/products/verve-coffee.png", badge: "New", collection: "new", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Silver", hex: "#c9c7c2" }], rating: 4.7, reviews: 88, inv: 26 },
    { slug: "monolith-pad", name: "Monolith Pad", cat: "electronics", short: "Sculptural wireless charger in matte charcoal.", desc: "Monolith Pad is a single block of matte charcoal with a soft blue charging indicator that breathes as your device powers up. One cable, one object, one ritual.", price: 6400, image: "/products/monolith-charger.png", badge: "Trending", collection: "trending", colors: [{ name: "Charcoal", hex: "#2b2b2e" }, { name: "Off-white", hex: "#f2efe8" }], rating: 4.6, reviews: 176, inv: 50 },
  ];

  const sizeMap: Record<string, string> = {
    fashion: "XS,S,M,L,XL",
    sneakers: "6,7,8,9,10,11",
    electronics: "One Size",
    accessories: "One Size",
    lifestyle: "One Size",
  };

  let created = 0;
  for (const p of seedProducts) {
    const category = await db.category.findUnique({ where: { slug: p.cat } });
    if (!category) continue;
    const tags = [p.cat, ...p.name.toLowerCase().split(" ")].join(",");
    const colors = p.colors.map((c) => c.name).join(",");
    const sizes = sizeMap[p.cat] || "One Size";
    const data = {
      name: p.name,
      shortDescription: p.short,
      description: p.desc,
      price: p.price,
      compareAtPrice: p.compareAt ?? null,
      categoryId: category.id,
      primaryImage: p.image,
      badge: p.badge ?? null,
      collection: p.collection ?? null,
      tags,
      sizes,
      colors,
      inventory: p.inv,
      featured: p.badge === "Editor's Pick",
      trending: p.collection === "trending",
      isNew: p.collection === "new",
      editorsPick: p.badge === "Editor's Pick",
      published: true,
      rating: p.rating,
      reviewCount: p.reviews,
    };
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await db.product.update({ where: { slug: p.slug }, data });
    } else {
      const prod = await db.product.create({ data: { ...data, slug: p.slug } });
      await db.productImage.create({
        data: { productId: prod.id, url: p.image, position: 0 },
      });
      for (const c of p.colors) {
        await db.productVariant.create({
          data: { productId: prod.id, name: c.name, type: "color", value: c.hex, inventory: p.inv },
        });
      }
      created++;
    }
  }
  console.log(`  ✓ ${seedProducts.length} products (${created} new)`);

  // --- Coupons ---
  const coupons = [
    { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 5000, maxDiscount: 5000, active: true },
    { code: "LUMEN500", type: "fixed", value: 500, minSubtotal: 8000, active: true },
    { code: "QUIET15", type: "percent", value: 15, minSubtotal: 30000, maxDiscount: 8000, active: true },
  ];
  for (const c of coupons) {
    await db.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`  ✓ ${coupons.length} coupons`);

  console.log("✅ Seed complete.");
  console.log("   Admin:     admin@lumen.store / AdminLumen#2024");
  console.log("   Customer:  customer@lumen.store / Customer#2024");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
