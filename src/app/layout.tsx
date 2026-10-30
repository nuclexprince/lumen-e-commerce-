import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "LUMEN — Objects of Quiet Luxury",
  description:
    "LUMEN is a premium futuristic lifestyle store. Art-directed objects of desire — electronics, fashion, sneakers, accessories and lifestyle essentials, designed for the future and made for now.",
  keywords: [
    "LUMEN",
    "luxury e-commerce",
    "premium products",
    "future shopping",
    "minimal design",
  ],
  authors: [{ name: "LUMEN Studio" }],
  openGraph: {
    title: "LUMEN — Objects of Quiet Luxury",
    description: "Art-directed objects of desire. Designed for the future.",
    siteName: "LUMEN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
