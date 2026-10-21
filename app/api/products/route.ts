import { NextRequest, NextResponse } from "next/server";
import { getStoredProducts, saveStoredProducts } from "@/lib/store";

export async function GET() {
  const products = await getStoredProducts();
  return NextResponse.json(products);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { password, products } = body;

  if (password !== "promo2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await saveStoredProducts(products);
  return NextResponse.json({ ok: true });
}
