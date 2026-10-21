import { cache } from "react";
import { getBlob, setBlob } from "@/lib/store";

/**
 * Contenido editable del sitio: promociones, testimonios y casos de exito.
 * Todo se administra desde /admin/contenido y vive en Blob.
 *
 * El sitio arranca SIN testimonios ni casos: son declaraciones de clientes
 * reales y no deben inventarse. Las secciones solo aparecen cuando hay algo
 * publicado de verdad.
 */

export type Promocion = {
  id: string;
  activa: boolean;
  /** etiqueta corta, p. ej. "Promoción del mes" */
  etiqueta: string;
  titulo: string;
  texto: string;
  /** vigencia en texto libre, p. ej. "Hasta el 30 de noviembre" */
  vigencia: string;
  cta: string;
  enlace: string;
  imagen: string;
};

export type Testimonio = {
  id: string;
  activo: boolean;
  nombre: string;
  puesto: string;
  empresa: string;
  texto: string;
  /** 1 a 5 */
  calificacion: number;
};

export type CasoExito = {
  id: string;
  activo: boolean;
  titulo: string;
  cliente: string;
  reto: string;
  solucion: string;
  resultado: string;
  imagen: string;
};

export type Contenido = {
  promociones: Promocion[];
  testimonios: Testimonio[];
  casos: CasoExito[];
  /** ventana emergente de escritorio con las promociones del mes */
  modal: {
    activo: boolean;
    titulo: string;
    texto: string;
  };
};

export const CONTENIDO_VACIO: Contenido = {
  promociones: [],
  testimonios: [],
  casos: [],
  modal: {
    activo: false,
    titulo: "Promociones del mes",
    texto: "Aprovecha los precios especiales de este mes en artículos seleccionados.",
  },
};

const KEY = "data/contenido.json";

function normalizar(c: Partial<Contenido> | null): Contenido {
  return {
    promociones: Array.isArray(c?.promociones) ? c.promociones : [],
    testimonios: Array.isArray(c?.testimonios) ? c.testimonios : [],
    casos: Array.isArray(c?.casos) ? c.casos : [],
    modal: {
      activo: Boolean(c?.modal?.activo),
      titulo: c?.modal?.titulo || CONTENIDO_VACIO.modal.titulo,
      texto: c?.modal?.texto || CONTENIDO_VACIO.modal.texto,
    },
  };
}

/** Todo el contenido, incluido lo despublicado (para el panel) */
export const getContenido = cache(async (): Promise<Contenido> => {
  const raw = await getBlob<Partial<Contenido> | null>(KEY, null);
  return normalizar(raw);
});

export async function saveContenido(c: Contenido): Promise<void> {
  await setBlob(KEY, normalizar(c));
}

/** Solo lo publicado, que es lo que ve el visitante */
export const getContenidoPublico = cache(async () => {
  const c = await getContenido();
  return {
    promociones: c.promociones.filter((p) => p.activa),
    testimonios: c.testimonios.filter((t) => t.activo),
    casos: c.casos.filter((k) => k.activo),
    modal: c.modal,
  };
});

export function nuevoId(prefijo: string): string {
  return `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
