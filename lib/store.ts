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

/**
 * Lo ultimo que escribio ESTA instancia. El Blob tarda unos segundos en
 * devolver lo recien guardado (el listado sigue reportando la version
 * anterior), asi que sin esto una lectura inmediata despues de guardar
 * devuelve datos viejos: justo lo que pasa al revalidar las paginas dentro
 * de la misma peticion que guardo.
 */
const recienEscrito = new Map<string, { data: unknown; at: number }>();
const VENTANA_MS = 2 * 60 * 1000;

export async function getBlob<T>(key: string, fallback: T): Promise<T> {
  const propio = recienEscrito.get(key);
  const vigente = propio && Date.now() - propio.at < VENTANA_MS;

  try {
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) {
      return vigente ? (propio.data as T) : fallback;
    }

    // si nuestra escritura es mas nueva que lo que reporta el listado,
    // el CDN va atrasado: vale mas lo que tenemos en memoria
    const subido = new Date(blobs[0].uploadedAt).getTime();
    if (vigente && Number.isFinite(subido) && propio.at > subido) {
      return propio.data as T;
    }

    // El blob se reescribe siempre con la misma ruta, asi que el CDN puede
    // devolver la version anterior justo despues de guardar. La marca de
    // tiempo de subida rompe esa cache sin perder el cacheo entre versiones.
    // Nota: no se usa cache "no-store" porque sacaria a las paginas del
    // prerenderizado estatico; basta con que la URL cambie por version.
    const stamp = new Date(blobs[0].uploadedAt).getTime();
    const url = `${blobs[0].url}?v=${Number.isFinite(stamp) ? stamp : Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return vigente ? (propio.data as T) : fallback;
  }
}

export async function setBlob<T>(key: string, data: T): Promise<void> {
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

  // se recuerda para que una lectura inmediata no devuelva la version vieja
  recienEscrito.set(key, { data, at: Date.now() });
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
