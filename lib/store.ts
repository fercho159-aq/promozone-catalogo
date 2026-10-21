import { put, list, del } from "@vercel/blob";

export interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  clientCompany: string;
  productId: string;
  productName: string;
  productColor: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  date: string;
  timestamp: number;
}

export interface StoredProduct {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  price: number;
  colors: { name: string; hex: string }[];
  material: string;
  capacity?: string;
  image: string;
  active: boolean;
}

const QUOTES_KEY = "data/quotes.json";
const PRODUCTS_KEY = "data/products.json";

async function getBlob<T>(key: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) return fallback;
    const res = await fetch(blobs[0].url);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function setBlob<T>(key: string, data: T): Promise<void> {
  // Delete old blob first
  try {
    const { blobs } = await list({ prefix: key });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch {
    // ignore
  }
  await put(key, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

// QUOTES
export async function getQuotes(): Promise<Quote[]> {
  return getBlob<Quote[]>(QUOTES_KEY, []);
}

export async function addQuote(quote: Omit<Quote, "id" | "timestamp">): Promise<Quote> {
  const quotes = await getQuotes();
  const newQuote: Quote = {
    ...quote,
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };
  quotes.unshift(newQuote);
  await setBlob(QUOTES_KEY, quotes);
  return newQuote;
}

// PRODUCTS (admin overrides)
export async function getStoredProducts(): Promise<StoredProduct[]> {
  return getBlob<StoredProduct[]>(PRODUCTS_KEY, []);
}

export async function saveStoredProducts(products: StoredProduct[]): Promise<void> {
  await setBlob(PRODUCTS_KEY, products);
}

// STATS
export async function getQuoteStats() {
  const quotes = await getQuotes();
  const productCounts: Record<string, { name: string; count: number; total: number }> = {};

  for (const q of quotes) {
    if (!productCounts[q.productId]) {
      productCounts[q.productId] = { name: q.productName, count: 0, total: 0 };
    }
    productCounts[q.productId].count++;
    productCounts[q.productId].total += q.total;
  }

  const topProducts = Object.entries(productCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count);

  return {
    totalQuotes: quotes.length,
    totalRevenue: quotes.reduce((sum, q) => sum + q.total, 0),
    topProducts,
    recentQuotes: quotes.slice(0, 20),
  };
}
