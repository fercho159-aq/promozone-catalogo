import { NextRequest, NextResponse } from "next/server";
import { getQuotes, addQuote, getQuoteStats } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stats = searchParams.get("stats");

  if (stats === "true") {
    const data = await getQuoteStats();
    return NextResponse.json(data);
  }

  const quotes = await getQuotes();
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const quote = await addQuote(body);
  return NextResponse.json(quote, { status: 201 });
}
