export type CategoryId =
  | "electronics"
  | "fashion"
  | "sneakers"
  | "accessories"
  | "lifestyle";

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  image: string;
  span: "tall" | "wide" | "regular";
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: CategoryId;
  categoryName: string;
  shortDescription: string;
  description: string;
  price: number; // INR
  originalPrice?: number;
  image: string;
  gallery: string[];
  badge?: "New" | "Trending" | "Editor's Pick" | "Limited";
  collection: "trending" | "new" | "editors";
  colors: { name: string; hex: string }[];
  rating: number;
  reviews: number;
  inStock: boolean;
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    tagline: "Engineered quietude",
    description:
      "Objects that think softly. Audio, wearables and ambient tech sculpted for the senses.",
    image: "/categories/electronics.png",
    span: "tall",
  },
  {
    id: "fashion",
    name: "Fashion",
    tagline: "Drape & form",
    description:
      "Tailored essentials in considered materials. Quiet silhouettes made to outlast the season.",
    image: "/categories/fashion.png",
    span: "wide",
  },
  {
    id: "sneakers",
    name: "Sneakers",
    tagline: "Forward motion",
    description:
      "Footwear engineered for movement and presence. Knit, leather, sculpted sole.",
    image: "/categories/sneakers.png",
    span: "regular",
  },
  {
    id: "accessories",
    name: "Accessories",
    tagline: "The finishing note",
    description:
      "Leather, light and metal — the small objects that complete a life well arranged.",
    image: "/categories/accessories.png",
    span: "regular",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    tagline: "The everyday ritual",
    description:
      "Ceramic, light and warmth. Objects that turn routine into ritual.",
    image: "/categories/lifestyle.png",
    span: "wide",
  },
];

export const products: Product[] = [
  {
    id: "aurora-earbuds",
    name: "Aurora Pro",
    slug: "aurora-pro",
    category: "electronics",
    categoryName: "Electronics",
    shortDescription: "Adaptive noise-cancelling earbuds in frosted glass.",
    description:
      "Aurora Pro reimagines personal audio as an object of design. Hand-finished frosted glass meets a titanium-accented driver tuned for spatial clarity. Adaptive silence that learns the room you're in.",
    price: 18900,
    originalPrice: 22500,
    image: "/products/aurora-earbuds.png",
    gallery: ["/products/aurora-earbuds.png"],
    badge: "Trending",
    collection: "trending",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Silver", hex: "#c9c7c2" },
    ],
    rating: 4.8,
    reviews: 312,
    inStock: true,
  },
  {
    id: "halo-speaker",
    name: "Halo Orb",
    slug: "halo-orb",
    category: "electronics",
    categoryName: "Electronics",
    shortDescription: "Sculptural ambient speaker with a breathing light ring.",
    description:
      "Halo Orb is a 360° ambient speaker wrapped in matte charcoal ceramic. A ring of soft light pulses with the music, turning listening into a visual ritual.",
    price: 34900,
    image: "/products/halo-speaker.png",
    gallery: ["/products/halo-speaker.png"],
    badge: "Editor's Pick",
    collection: "editors",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Off-white", hex: "#f2efe8" },
    ],
    rating: 4.9,
    reviews: 148,
    inStock: true,
  },
  {
    id: "pulse-watch",
    name: "Pulse Field",
    slug: "pulse-field",
    category: "electronics",
    categoryName: "Electronics",
    shortDescription: "Sapphire-face smartwatch with a woven charcoal band.",
    description:
      "Pulse Field pairs a sapphire glass face with a woven charcoal band. Onboard health sensing, a 14-day battery and an interface that disappears until you need it.",
    price: 41500,
    image: "/products/pulse-watch.png",
    gallery: ["/products/pulse-watch.png"],
    badge: "New",
    collection: "new",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Electric", hex: "#3b6fe0" },
    ],
    rating: 4.7,
    reviews: 96,
    inStock: true,
  },
  {
    id: "eclipse-coat",
    name: "Eclipse Overcoat",
    slug: "eclipse-overcoat",
    category: "fashion",
    categoryName: "Fashion",
    shortDescription: "Tailored charcoal wool overcoat, double-faced.",
    description:
      "The Eclipse is cut from double-faced Italian wool with a relaxed, architectural drape. No lining, no fuss — just a coat that falls exactly where it should.",
    price: 68900,
    originalPrice: 79000,
    image: "/products/eclipse-coat.png",
    gallery: ["/products/eclipse-coat.png"],
    badge: "Editor's Pick",
    collection: "editors",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Stone", hex: "#9b958a" },
    ],
    rating: 4.9,
    reviews: 64,
    inStock: true,
  },
  {
    id: "nimbus-scarf",
    name: "Nimbus Cashmere",
    slug: "nimbus-cashmere",
    category: "fashion",
    categoryName: "Fashion",
    shortDescription: "Featherweight cashmere scarf in soft silver grey.",
    description:
      "Spun from grade-A Mongolian cashmere, Nimbus is a featherweight scarf that drapes like smoke and warms like wool should.",
    price: 12400,
    image: "/products/nimbus-scarf.png",
    gallery: ["/products/nimbus-scarf.png"],
    badge: "New",
    collection: "new",
    colors: [
      { name: "Silver", hex: "#c9c7c2" },
      { name: "Charcoal", hex: "#2b2b2e" },
    ],
    rating: 4.8,
    reviews: 87,
    inStock: true,
  },
  {
    id: "velocity-runner",
    name: "Velocity Runner",
    slug: "velocity-runner",
    category: "sneakers",
    categoryName: "Sneakers",
    shortDescription: "Knit-upper runner with an electric-blue sole.",
    description:
      "Velocity Runner pairs a recycled knit upper with a sculpted, energy-returning sole. A single line of electric blue traces the arc of every step.",
    price: 16900,
    originalPrice: 19500,
    image: "/products/velocity-runner.png",
    gallery: ["/products/velocity-runner.png"],
    badge: "Trending",
    collection: "trending",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Electric", hex: "#3b6fe0" },
    ],
    rating: 4.7,
    reviews: 204,
    inStock: true,
  },
  {
    id: "drift-sneaker",
    name: "Drift Minimal",
    slug: "drift-minimal",
    category: "sneakers",
    categoryName: "Sneakers",
    shortDescription: "Minimalist leather sneaker in warm off-white.",
    description:
      "Drift Minimal is a single-piece leather sneaker on a clean cup-sole. No logos, no noise — just considered proportion and a sole that wears in, not out.",
    price: 14200,
    image: "/products/drift-sneaker.png",
    gallery: ["/products/drift-sneaker.png"],
    badge: "New",
    collection: "new",
    colors: [
      { name: "Off-white", hex: "#f2efe8" },
      { name: "Stone", hex: "#9b958a" },
    ],
    rating: 4.8,
    reviews: 158,
    inStock: true,
  },
  {
    id: "solace-tote",
    name: "Solace Tote",
    slug: "solace-tote",
    category: "accessories",
    categoryName: "Accessories",
    shortDescription: "Structured leather tote in warm taupe.",
    description:
      "Solace is a full-grain leather tote with a single magnetic closure and a hidden laptop sleeve. Vegetable-tanned, hand-finished, built to age well.",
    price: 28900,
    image: "/products/solace-tote.png",
    gallery: ["/products/solace-tote.png"],
    badge: "Editor's Pick",
    collection: "editors",
    colors: [
      { name: "Taupe", hex: "#9b8b73" },
      { name: "Charcoal", hex: "#2b2b2e" },
    ],
    rating: 4.9,
    reviews: 73,
    inStock: true,
  },
  {
    id: "ember-sunglasses",
    name: "Ember Optics",
    slug: "ember-optics",
    category: "accessories",
    categoryName: "Accessories",
    shortDescription: "Sculptural sunglasses with thin silver frames.",
    description:
      "Ember Optics is a hand-polished frame in surgical-grade steel with subtly tinted, polarised lenses. UV400 protection in a silhouette that suits every face.",
    price: 9800,
    image: "/products/ember-sunglasses.png",
    gallery: ["/products/ember-sunglasses.png"],
    badge: "Trending",
    collection: "trending",
    colors: [
      { name: "Silver", hex: "#c9c7c2" },
      { name: "Charcoal", hex: "#2b2b2e" },
    ],
    rating: 4.6,
    reviews: 119,
    inStock: true,
  },
  {
    id: "lumen-lamp",
    name: "Lumen Vessel Lamp",
    slug: "lumen-vessel-lamp",
    category: "lifestyle",
    categoryName: "Lifestyle",
    shortDescription: "Ceramic table lamp with a soft glowing diffuser.",
    description:
      "Lumen Vessel is a slip-cast ceramic lamp with a hand-glazed exterior and a softly diffused inner light. A warm, breathing presence for the table.",
    price: 15600,
    image: "/products/lumen-lamp.png",
    gallery: ["/products/lumen-lamp.png"],
    badge: "Editor's Pick",
    collection: "editors",
    colors: [
      { name: "Off-white", hex: "#f2efe8" },
      { name: "Charcoal", hex: "#2b2b2e" },
    ],
    rating: 4.9,
    reviews: 52,
    inStock: true,
  },
  {
    id: "verve-coffee",
    name: "Verve Pour-Over",
    slug: "verve-pour-over",
    category: "lifestyle",
    categoryName: "Lifestyle",
    shortDescription: "Matte ceramic carafe with a glass pour-over server.",
    description:
      "Verve is a pour-over ritual in two materials — matte black ceramic for warmth, borosilicate glass for clarity. A brushed steel tray grounds the set.",
    price: 8900,
    originalPrice: 10500,
    image: "/products/verve-coffee.png",
    gallery: ["/products/verve-coffee.png"],
    badge: "New",
    collection: "new",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Silver", hex: "#c9c7c2" },
    ],
    rating: 4.7,
    reviews: 88,
    inStock: true,
  },
  {
    id: "monolith-charger",
    name: "Monolith Pad",
    slug: "monolith-pad",
    category: "electronics",
    categoryName: "Electronics",
    shortDescription: "Sculptural wireless charger in matte charcoal.",
    description:
      "Monolith Pad is a single block of matte charcoal with a soft blue charging indicator that breathes as your device powers up. One cable, one object, one ritual.",
    price: 6400,
    image: "/products/monolith-charger.png",
    gallery: ["/products/monolith-charger.png"],
    badge: "Trending",
    collection: "trending",
    colors: [
      { name: "Charcoal", hex: "#2b2b2e" },
      { name: "Off-white", hex: "#f2efe8" },
    ],
    rating: 4.6,
    reviews: 176,
    inStock: true,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.slug === id);
}

export function getByCollection(c: Product["collection"]) {
  return products.filter((p) => p.collection === c);
}

export function getByCategory(cat: CategoryId) {
  return products.filter((p) => p.category === cat);
}

export const editorialImages = [
  "/editorial/ed-1.png",
  "/editorial/ed-2.png",
  "/editorial/ed-3.png",
  "/editorial/ed-4.png",
];
