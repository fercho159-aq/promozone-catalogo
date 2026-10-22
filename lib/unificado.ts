import { cache } from "react";
import { getBlob, setBlob } from "@/lib/store";
import {
  getCatalogoProveedor,
  slugifyProveedor,
  type ArticuloProveedor,
  type VarianteColor,
} from "@/lib/proveedor";
import { margenCatalogo } from "@/lib/site";

/**
 * Catalogo unificado: un solo listado para el visitante, armado con tres
 * capas que el no distingue.
 *
 *   1. Los articulos de la API de ForPromotional.
 *   2. Ajustes encima de esos articulos (precio fijo, ocultar, corregir
 *      nombre o descripcion). No tocan la API: cuando el proveedor actualice
 *      su catalogo, los ajustes siguen aplicando.
 *   3. Articulos propios cargados uno por uno desde el panel, clasificados
 *      con las MISMAS categorias de la API para que queden mezclados.
 */

const KEY = "data/catalogo.json";

export type ArticuloManual = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  /** debe salir de las categorias de la API */
  categoria: string;
  subcategoria: string;
  composicion: string;
  medidas: string | null;
  capacidad: string | null;
  areaImpresion: string | null;
  metodosImpresion: string[];
  /** precio publico directo: no pasa por el margen del proveedor */
  precio: number;
  inventario: number;
  nuevo: boolean;
  promocion: boolean;
  imagen: string | null;
  imagenes: string[];
  colores: VarianteColor[];
  keywords: string;
  activo: boolean;
};

export type AjusteProveedor = {
  /** precio publico fijo; sustituye al margen */
  precio?: number;
  oculto?: boolean;
  nombre?: string;
  descripcion?: string;
};

export type CatalogoEditable = {
  /**
   * Factor por el que se multiplica el precio de lista del proveedor.
   * 1.45 = el costo mas 45%, que deja 31% de utilidad sobre la venta.
   * Los precios fijos por articulo mandan sobre este factor.
   */
  margen: number;
  manuales: ArticuloManual[];
  /** indexado por el codigo del proveedor, p. ej. "T 137" */
  ajustes: Record<string, AjusteProveedor>;
};

export const CATALOGO_VACIO: CatalogoEditable = {
  margen: margenCatalogo,
  manuales: [],
  ajustes: {},
};

/** Lo que consumen las paginas: el origen ya no importa */
export type ArticuloCatalogo = {
  id: string;
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
  /** precio publico ya resuelto */
  precio: number;
  inventario: number;
  nuevo: boolean;
  promocion: boolean;
  imagen: string | null;
  imagenes: string[];
  colores: VarianteColor[];
  keywords: string;
  origen: "api" | "propio";
};

function normalizar(c: Partial<CatalogoEditable> | null): CatalogoEditable {
  const margen = Number(c?.margen);
  return {
    // se acota para que un dedazo no deje el catalogo en cero o por las nubes
    margen: Number.isFinite(margen) && margen >= 1 && margen <= 10 ? margen : margenCatalogo,
    manuales: Array.isArray(c?.manuales) ? c.manuales : [],
    ajustes:
      c?.ajustes && typeof c.ajustes === "object" && !Array.isArray(c.ajustes)
        ? c.ajustes
        : {},
  };
}

export const getCatalogoEditable = cache(async (): Promise<CatalogoEditable> => {
  const raw = await getBlob<Partial<CatalogoEditable> | null>(KEY, null);
  return normalizar(raw);
});

export async function saveCatalogoEditable(c: CatalogoEditable): Promise<void> {
  await setBlob(KEY, normalizar(c));
}

/** Precio de lista del proveedor -> precio publico */
function conMargen(precioProveedor: number, margen: number): number {
  return Math.ceil(precioProveedor * margen);
}

function desdeProveedor(
  a: ArticuloProveedor,
  ajuste: AjusteProveedor | undefined,
  margen: number,
): ArticuloCatalogo {
  return {
    id: a.id,
    codigo: a.codigo,
    nombre: ajuste?.nombre?.trim() || a.nombre,
    descripcion: ajuste?.descripcion?.trim() || a.descripcion,
    categoria: a.categoria,
    categoriaSlug: a.categoriaSlug,
    subcategoria: a.subcategoria,
    composicion: a.composicion,
    medidas: a.medidas,
    capacidad: a.capacidad,
    areaImpresion: a.areaImpresion,
    metodosImpresion: a.metodosImpresion,
    precio:
      typeof ajuste?.precio === "number" && ajuste.precio > 0
        ? ajuste.precio
        : conMargen(a.precioProveedor, margen),
    inventario: a.inventario,
    nuevo: a.nuevo,
    promocion: a.promocion,
    imagen: a.imagen,
    imagenes: a.imagenes,
    colores: a.colores,
    keywords: a.keywords,
    origen: "api",
  };
}

function desdeManual(m: ArticuloManual): ArticuloCatalogo {
  return {
    id: m.id,
    codigo: m.codigo,
    nombre: m.nombre,
    descripcion: m.descripcion,
    categoria: m.categoria,
    categoriaSlug: slugifyProveedor(m.categoria),
    subcategoria: m.subcategoria,
    composicion: m.composicion,
    medidas: m.medidas,
    capacidad: m.capacidad,
    areaImpresion: m.areaImpresion,
    metodosImpresion: m.metodosImpresion,
    precio: m.precio,
    inventario: m.inventario,
    nuevo: m.nuevo,
    promocion: m.promocion,
    imagen: m.imagen,
    imagenes: m.imagenes,
    colores: m.colores,
    keywords: m.keywords,
    origen: "propio",
  };
}

/** Todo lo publicable, mezclado y ordenado por nombre */
export const getCatalogoUnificado = cache(async (): Promise<ArticuloCatalogo[]> => {
  const [api, editable] = await Promise.all([
    getCatalogoProveedor(),
    getCatalogoEditable(),
  ]);

  const deApi = api
    .filter((a) => !editable.ajustes[a.codigo]?.oculto)
    .map((a) => desdeProveedor(a, editable.ajustes[a.codigo], editable.margen));

  const propios = editable.manuales
    .filter((m) => m.activo)
    .map(desdeManual);

  // si un articulo propio reusa un id de la API, gana el propio
  const ids = new Set(propios.map((p) => p.id));
  const mezcla = [...propios, ...deApi.filter((a) => !ids.has(a.id))];

  return mezcla.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
});

export async function getArticuloCatalogo(
  id: string,
): Promise<ArticuloCatalogo | undefined> {
  const todos = await getCatalogoUnificado();
  return todos.find((a) => a.id === id);
}

export type CategoriaCatalogo = {
  nombre: string;
  slug: string;
  total: number;
};

export const getCategoriasCatalogo = cache(async (): Promise<CategoriaCatalogo[]> => {
  const todos = await getCatalogoUnificado();
  const conteo = new Map<string, { nombre: string; total: number }>();
  for (const a of todos) {
    const actual = conteo.get(a.categoriaSlug);
    if (actual) actual.total++;
    else conteo.set(a.categoriaSlug, { nombre: a.categoria, total: 1 });
  }
  return [...conteo.entries()]
    .map(([slug, v]) => ({ slug, nombre: v.nombre, total: v.total }))
    .sort((a, b) => b.total - a.total);
});

export async function buscarEnCatalogo({
  q = "",
  categoria = "",
  pagina = 1,
  porPagina = 48,
}: {
  q?: string;
  categoria?: string;
  pagina?: number;
  porPagina?: number;
}) {
  const todos = await getCatalogoUnificado();
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

/** Para los relacionados de la ficha */
export async function getRelacionados(
  articulo: Pick<ArticuloCatalogo, "id" | "categoriaSlug" | "subcategoria">,
  limite = 4,
): Promise<ArticuloCatalogo[]> {
  const todos = await getCatalogoUnificado();
  return todos
    .filter(
      (a) =>
        a.id !== articulo.id &&
        (a.subcategoria === articulo.subcategoria ||
          a.categoriaSlug === articulo.categoriaSlug),
    )
    .slice(0, limite);
}

/**
 * Catalogo completo para el panel: incluye lo oculto y marca el origen y el
 * precio de lista, para poder compararlo con el ajuste.
 */
export async function getCatalogoAdmin() {
  const [api, editable] = await Promise.all([
    getCatalogoProveedor(),
    getCatalogoEditable(),
  ]);

  const deApi = api.map((a) => {
    const ajuste = editable.ajustes[a.codigo];
    return {
      ...desdeProveedor(a, ajuste, editable.margen),
      oculto: Boolean(ajuste?.oculto),
      precioBase: conMargen(a.precioProveedor, editable.margen),
      precioAjustado: typeof ajuste?.precio === "number" ? ajuste.precio : null,
    };
  });

  const propios = editable.manuales.map((m) => ({
    ...desdeManual(m),
    oculto: !m.activo,
    precioBase: m.precio,
    precioAjustado: null,
  }));

  return [...propios, ...deApi].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function nuevoIdManual(nombre: string, existentes: Set<string>): string {
  const base = slugifyProveedor(nombre) || `articulo-${Date.now()}`;
  let id = base;
  let n = 2;
  while (existentes.has(id)) id = `${base}-${n++}`;
  return id;
}
