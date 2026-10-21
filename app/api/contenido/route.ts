import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getContenido, saveContenido, type Contenido } from "@/lib/contenido";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getContenido());
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { contenido?: Contenido } | null;
  const c = body?.contenido;

  if (!c || typeof c !== "object") {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }
  if (!Array.isArray(c.promociones) || !Array.isArray(c.testimonios) || !Array.isArray(c.casos)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  await saveContenido(c);

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
