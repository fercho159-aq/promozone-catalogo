import { NextRequest, NextResponse } from "next/server";
import { getQuotes, addQuote, getQuoteStats, saveQuotes } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stats = searchParams.get("stats");

  if (stats === "true") {
    const data = await getQuoteStats();
    return NextResponse.json(data);
  }

  const quotes = await getQuotes();

  // solo el conteo de las nuevas, para el aviso del menu del panel
  const desde = Number(searchParams.get("desde"));
  if (Number.isFinite(desde) && searchParams.has("desde")) {
    return NextResponse.json({
      nuevas: quotes.filter((q) => (q.timestamp || 0) > desde).length,
      total: quotes.length,
    });
  }

  return NextResponse.json(quotes);
}

/** Borra una cotizacion. Solo desde el panel. */
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  const quotes = await getQuotes();
  const restantes = quotes.filter((q) => q.id !== id);
  if (restantes.length === quotes.length) {
    return NextResponse.json({ error: "No existe esa cotización" }, { status: 404 });
  }

  await saveQuotes(restantes);
  return NextResponse.json({ ok: true, restantes: restantes.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // el origen llega del navegador: solo se aceptan los dos valores conocidos
  const origen = body.origen === "pdf" || body.origen === "whatsapp" ? body.origen : undefined;
  const quote = await addQuote({ ...body, origen });
  return NextResponse.json(quote, { status: 201 });
}
