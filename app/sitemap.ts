import type { MetadataRoute } from "next";
import { getCategoriasCatalogo } from "@/lib/unificado";
import { site } from "@/lib/site";

// se regenera cada hora para recoger lo que se publique desde el panel
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${site.url}/catalogo`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${site.url}/textiles-y-proyectos-especiales`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  /*
   * Se indexan el catalogo y sus categorias, no las ~1,900 fichas. El texto de
   * los articulos del proveedor lo comparten todos sus distribuidores, asi que
   * subirlas en bloque seria contenido duplicado. Siguen siendo rastreables
   * desde el listado.
   */
  let categorias: MetadataRoute.Sitemap = [];
  try {
    const cats = await getCategoriasCatalogo();
    categorias = cats.map((c) => ({
      url: `${site.url}/catalogo?categoria=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    categorias = [];
  }

  return [...base, ...categorias];
}
