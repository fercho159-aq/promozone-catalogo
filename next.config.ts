import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // las imagenes que suba el admin viven en Vercel Blob
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // imagenes del catalogo del proveedor (ForPromotional)
        protocol: "https",
        hostname: "assets.4promotional.net",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // el hero usa 80; Next exige declarar cada calidad empleada
    qualities: [75, 80],
  },
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        // el panel nunca debe aparecer en buscadores
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
