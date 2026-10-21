/**
 * Catalogo del proveedor (ForPromotional / 4promotional.net),
 * API Clients External 2.0.
 *
 * IMPORTANTE: este modulo es solo de servidor. El token nunca debe llegar al
 * navegador, asi que no debe importarse desde un componente "use client".
 *
 * La respuesta pesa ~7.5 MB y tarda ~4.5 s, y devuelve una fila por variante
 * de color (4,305 filas = 1,858 articulos). Aqui se agrupa por articulo y se
 * guarda una proyeccion reducida en memoria con TTL, para no volver a pedirla
 * en cada visita.
 */

const API_URL = "https://api-external-clients.4promotional.net/api/products";
const TTL_MS = 60 * 60 * 1000; // 1 hora

export type VarianteColor = {
  color: string;
  inventario: number;
  imagen: string | null;
};

export type ArticuloProveedor = {
  /** slug para la URL, derivado del codigo del proveedor */
  id: string;
  /** codigo tal cual lo da el proveedor, p. ej. "AG 001" */
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  categoriaSlug: string;
  subcategoria: string;
  composicion: string;
  medidas: string | null;
  capacidad: string | null;
  areaImpresion: string | null;
  metodosImpresion: string[];
  /** precio de lista del proveedor, sin margen */
  precioProveedor: number;
  inventario: number;
  nuevo: boolean;
  promocion: boolean;
  imagen: string | null;
  imagenes: string[];
  colores: VarianteColor[];
  keywords: string;
};

export type CategoriaProveedor = {
  nombre: string;
  slug: string;
  total: number;
};

type FilaApi = Record<string, unknown>;

export function slugifyProveedor(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(v: unknown): number {
  const n = Number.parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function agrupar(filas: FilaApi[]): ArticuloProveedor[] {
  const porCodigo = new Map<string, ArticuloProveedor>();

  for (const f of filas) {
    const codigo = str(f.id_articulo);
    if (!codigo) continue;
    if (str(f.web) !== "SI") continue; // el proveedor marca lo publicable

    const imagenes = Array.isArray(f.images)
      ? (f.images as { tipo_imagen?: string; url_imagen?: string }[])
          .map((i) => str(i?.url_imagen))
          .filter(Boolean)
      : [];

    const color = str(f.color);
    const inventario = num(f.inventario);

    const existente = porCodigo.get(codigo);
    if (existente) {
      if (color && !existente.colores.some((c) => c.color === color)) {
        existente.colores.push({ color, inventario, imagen: imagenes[0] ?? null });
      }
      existente.inventario += inventario;
      for (const img of imagenes) {
        if (!existente.imagenes.includes(img)) existente.imagenes.push(img);
      }
      // se queda el precio mas bajo entre variantes
      const p = num(f.precio);
      if (p > 0 && p < existente.precioProveedor) existente.precioProveedor = p;
      continue;
    }

    const categoria = str(f.categoria) || "Otros";
    porCodigo.set(codigo, {
      id: slugifyProveedor(codigo),
      codigo,
      nombre: str(f.nombre_artd) || codigo,
      descripcion: str(f.descripcion),
      categoria,
      categoriaSlug: slugifyProveedor(categoria),
      subcategoria: str(f.sub_categoria),
      composicion: str(f.composicion),
      medidas:
        num(f.medida_producto_alto) > 0 || num(f.medida_producto_ancho) > 0
          ? `${num(f.medida_producto_alto)} x ${num(f.medida_producto_ancho)} cm`
          : null,
      capacidad: str(f.capacidad) || null,
      areaImpresion: str(f.area_impresion) || null,
      metodosImpresion: str(f.metodos_impresion)
        .split("-")
        .map((m) => m.trim())
        .filter(Boolean),
      precioProveedor: num(f.precio),
      inventario,
      nuevo: str(f.producto_nuevo) === "SI",
      promocion: str(f.producto_promocion) === "SI",
      imagen: imagenes[0] ?? null,
      imagenes,
      colores: color ? [{ color, inventario, imagen: imagenes[0] ?? null }] : [],
      keywords: str(f.keywords),
    });
  }

  return [...porCodigo.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

let cache: { data: ArticuloProveedor[]; expira: number } | null = null;
let enVuelo: Promise<ArticuloProveedor[]> | null = null;

async function descargar(): Promise<ArticuloProveedor[]> {
  const token = process.env.FORPROMOTIONAL_API_TOKEN;
  if (!token) {
    console.warn("[proveedor] falta FORPROMOTIONAL_API_TOKEN");
    return [];
  }

  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    // La respuesta supera el limite de la cache de datos de Next, asi que
    // quien cachea de verdad es el mapa en memoria de abajo. Aun asi se pide
    // con revalidate en vez de no-store: no-store marca como dinamica toda
    // ruta que llame aqui, incluido el sitemap.
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    console.error("[proveedor] respuesta", res.status, res.statusText);
    return [];
  }

  const json = (await res.json()) as Record<string, FilaApi>;
  return agrupar(Object.values(json));
}

/** Catalogo completo del proveedor, cacheado en memoria por TTL_MS */
export async function getCatalogoProveedor(): Promise<ArticuloProveedor[]> {
  if (cache && cache.expira > Date.now()) return cache.data;
  if (enVuelo) return enVuelo;

  enVuelo = descargar()
    .then((data) => {
      // si falla, se conserva lo ultimo bueno en vez de dejar la pagina vacia
      if (data.length === 0 && cache) return cache.data;
      cache = { data, expira: Date.now() + TTL_MS };
      return data;
    })
    .catch((e) => {
      console.error("[proveedor] error al descargar:", e);
      return cache?.data ?? [];
    })
    .finally(() => {
      enVuelo = null;
    });

  return enVuelo;
}

export async function getCategoriasProveedor(): Promise<CategoriaProveedor[]> {
  const todos = await getCatalogoProveedor();
  const conteo = new Map<string, { nombre: string; total: number }>();
  for (const a of todos) {
    const actual = conteo.get(a.categoriaSlug);
    if (actual) actual.total++;
    else conteo.set(a.categoriaSlug, { nombre: a.categoria, total: 1 });
  }
  return [...conteo.entries()]
    .map(([slug, v]) => ({ slug, nombre: v.nombre, total: v.total }))
    .sort((a, b) => b.total - a.total);
}

export async function getArticuloProveedor(
  id: string,
): Promise<ArticuloProveedor | undefined> {
  const todos = await getCatalogoProveedor();
  return todos.find((a) => a.id === id);
}

export type FiltrosCatalogo = {
  q?: string;
  categoria?: string;
  pagina?: number;
  porPagina?: number;
};

export async function buscarEnProveedor({
  q = "",
  categoria = "",
  pagina = 1,
  porPagina = 48,
}: FiltrosCatalogo) {
  const todos = await getCatalogoProveedor();
  const termino = q.trim().toLowerCase();

  const filtrados = todos.filter((a) => {
    if (categoria && a.categoriaSlug !== categoria) return false;
    if (!termino) return true;
    return (
      a.nombre.toLowerCase().includes(termino) ||
      a.codigo.toLowerCase().includes(termino) ||
      a.subcategoria.toLowerCase().includes(termino) ||
      a.descripcion.toLowerCase().includes(termino) ||
      a.keywords.toLowerCase().includes(termino)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const actual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (actual - 1) * porPagina;

  return {
    items: filtrados.slice(inicio, inicio + porPagina),
    total: filtrados.length,
    totalGeneral: todos.length,
    pagina: actual,
    totalPaginas,
  };
}
