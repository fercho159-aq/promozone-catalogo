import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveStoredProducts } from "@/lib/store";
import { getFullCatalog, type CatalogProduct } from "@/lib/catalog";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Catalogo completo ya normalizado (incluye inactivos) para el panel */
export async function GET() {
  const products = await getFullCatalog();
  return NextResponse.json(products);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const products = body?.products;

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  // validacion minima: lo que se guarda alimenta el sitio publico
  for (const p of products as CatalogProduct[]) {
    if (!p?.id || !p?.name || typeof p.price !== "number" || Number.isNaN(p.price)) {
      return NextResponse.json(
        { error: `Producto inválido: ${p?.name || p?.id || "sin nombre"}` },
        { status: 400 },
      );
    }
  }

  await saveStoredProducts(products);

  // el catalogo publico se sirve con revalidate; esto lo refresca de inmediato
  revalidatePath("/");
  revalidatePath("/categoria/[slug]", "page");
  revalidatePath("/producto/[id]", "page");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true, count: products.length });
}
