import type { MetadataRoute } from "next";
import { categories } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
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

  return [...home, ...categoryUrls, ...productUrls];
}
