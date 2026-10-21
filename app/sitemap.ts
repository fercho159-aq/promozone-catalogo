import type { MetadataRoute } from "next";
import { categories } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import { getCategoriasProveedor } from "@/lib/proveedor";
import { site } from "@/lib/site";

// se regenera cada hora para recoger los productos dados de alta en el admin
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${site.url}/categoria/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await getCatalog();
    productUrls = products.map((p) => ({
      url: `${site.url}/producto/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    productUrls = [];
  }

  // Catalogo del proveedor: se indexan el listado y sus categorias, pero no
  // las ~1,858 fichas. Su texto es el del proveedor y lo comparten todos sus
  // distribuidores: subirlas en bloque seria contenido duplicado. Siguen
  // siendo rastreables desde el listado.
  let proveedorUrls: MetadataRoute.Sitemap = [];
  try {
    const cats = await getCategoriasProveedor();
    proveedorUrls = [
      {
        url: `${site.url}/catalogo`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      },
      ...cats.map((c) => ({
        url: `${site.url}/catalogo?categoria=${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    proveedorUrls = [];
  }

  return [...home, ...proveedorUrls, ...categoryUrls, ...productUrls];
}
