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
  async redirects() {
    // Las rutas del catalogo viejo se unificaron en /catalogo. Se redirige en
    // vez de borrar para no dejar enlaces muertos: los ids de producto se
    // conservaron al migrar, asi que la equivalencia es 1 a 1.
    const categorias: Record<string, string> = {
      termos: "bebidas",
      tazas: "bebidas",
      cilindros: "bebidas",
      textiles: "textil",
      escritura: "boligrafos",
      tecnologia: "tecnologia",
      bolsas: "tiempo-libre",
      llaveros: "llaveros",
    };

    return [
      {
        source: "/producto/:id",
        destination: "/catalogo/:id",
        permanent: true,
      },
      ...Object.entries(categorias).map(([viejo, nuevo]) => ({
        source: `/categoria/${viejo}`,
        destination: `/catalogo?categoria=${nuevo}`,
        permanent: true,
      })),
      {
        // cualquier otra categoria vieja cae al catalogo completo
        source: "/categoria/:slug",
        destination: "/catalogo",
        permanent: true,
      },
    ];
  },
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
