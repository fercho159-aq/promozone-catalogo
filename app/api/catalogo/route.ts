import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import {
  getCatalogoAdmin,
  getCatalogoEditable,
  saveCatalogoEditable,
  type CatalogoEditable,
} from "@/lib/unificado";
import { getCategoriasProveedor } from "@/lib/proveedor";

export const dynamic = "force-dynamic";

/**
 * GET  -> catalogo completo para el panel + la capa editable + las categorias
 * PUT  -> guarda la capa editable (ajustes sobre la API y articulos propios)
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [articulos, editable, categorias] = await Promise.all([
    getCatalogoAdmin(),
    getCatalogoEditable(),
    getCategoriasProveedor(),
  ]);

  return NextResponse.json({ articulos, editable, categorias });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { catalogo?: CatalogoEditable }
    | null;
  const c = body?.catalogo;

  if (!c || !Array.isArray(c.manuales) || typeof c.ajustes !== "object") {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  for (const m of c.manuales) {
    if (!m?.id || !m?.nombre?.trim()) {
      return NextResponse.json(
        { error: `Artículo sin nombre: ${m?.codigo || m?.id || "?"}` },
        { status: 400 },
      );
    }
    if (typeof m.precio !== "number" || !(m.precio > 0)) {
      return NextResponse.json(
        { error: `"${m.nombre}" necesita un precio mayor a 0` },
        { status: 400 },
      );
    }
    if (!m.categoria?.trim()) {
      return NextResponse.json(
        { error: `"${m.nombre}" necesita una categoría` },
        { status: 400 },
      );
    }
  }

  await saveCatalogoEditable(c);

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/catalogo/[id]", "page");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    ok: true,
    manuales: c.manuales.length,
    ajustes: Object.keys(c.ajustes).length,
  });
}
