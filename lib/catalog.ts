import { cache } from "react";
import {
  products as defaultProducts,
  categories,
  type Product,
} from "@/lib/products";
import { getStoredProducts } from "@/lib/store";

export type CatalogProduct = Product & {
  sku: string;
  active: boolean;
};

/**
 * SKU derivado y estable cuando el producto no trae uno propio.
 * termo-niza (Termos) -> PZ-TER-NIZA
 *
 * Se descarta la primera palabra del id porque suele repetir el tipo de
 * producto ("boligrafo-deneb", "boligrafo-linx"): usarla produciria el mismo
 * SKU para toda la categoria.
 */
export function deriveSku(p: Pick<Product, "id" | "categorySlug">): string {
  const cat = (p.categorySlug || "gen").slice(0, 3).toUpperCase();
  const parts = p.id.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const tail = (parts.length > 1 ? parts.slice(1) : parts)
    .join("")
    .slice(0, 10)
    .toUpperCase();
  return `PZ-${cat}-${tail || "000"}`;
}

function normalize(p: Partial<CatalogProduct> & Product): CatalogProduct {
  return {
    ...p,
    sku: p.sku?.trim() || deriveSku(p),
    active: p.active !== false,
    colors: Array.isArray(p.colors) && p.colors.length > 0
      ? p.colors
      : [{ name: "Natural", hex: "#d8c8b0" }],
  };
}

/**
 * Catalogo completo (incluye inactivos). El admin guarda la lista entera en
 * Blob, asi que cuando existe tiene prioridad sobre el archivo estatico.
 * Si el Blob falla o esta vacio, se cae al catalogo base del repositorio.
 */
export const getFullCatalog = cache(async (): Promise<CatalogProduct[]> => {
  let stored: Product[] = [];
  try {
    stored = (await getStoredProducts()) as unknown as Product[];
  } catch {
    stored = [];
  }
  const source = stored.length > 0 ? stored : defaultProducts;

  // un SKU repetido confunde al cliente y rompe el dato structured de Product
  const seen = new Map<string, number>();
  return source.map((p) => {
    const item = normalize(p as Product);
    const n = seen.get(item.sku) ?? 0;
    seen.set(item.sku, n + 1);
    if (n > 0) item.sku = `${item.sku}-${n + 1}`;
    return item;
  });
});

/** Solo lo que debe verse en el sitio publico */
export const getCatalog = cache(async (): Promise<CatalogProduct[]> => {
  const all = await getFullCatalog();
  return all.filter((p) => p.active);
});

export async function getCatalogProduct(
  id: string,
): Promise<CatalogProduct | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.id === id);
}

export async function getCatalogByCategory(
  slug: string,
): Promise<CatalogProduct[]> {
  const all = await getCatalog();
  return all.filter((p) => p.categorySlug === slug);
}

/** Categorias con su conteo real de productos activos */
export async function getCategoriesWithCounts() {
  const all = await getCatalog();
  return categories.map((cat) => ({
    ...cat,
    count: all.filter((p) => p.categorySlug === cat.slug).length,
  }));
}

/** Productos relacionados de la misma categoria */
export async function getRelatedProducts(
  product: Pick<CatalogProduct, "id" | "categorySlug">,
  limit = 4,
): Promise<CatalogProduct[]> {
  const all = await getCatalogByCategory(product.categorySlug);
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}
