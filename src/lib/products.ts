// LUMEN catalog types.
// Product data is now sourced from the database via /api/products and the
// CatalogProvider context. This file keeps shared types + constants.

export type CategoryId = string;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  categoryName: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery: string[];
  badge?: string;
  collection?: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  tags: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  inventory: number;
  featured: boolean;
  trending: boolean;
  isNew: boolean;
  editorsPick: boolean;
  published: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  span: string;
};

export const editorialImages = [
  "/editorial/ed-1.png",
  "/editorial/ed-2.png",
  "/editorial/ed-3.png",
  "/editorial/ed-4.png",
];
