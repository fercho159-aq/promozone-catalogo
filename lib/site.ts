/**
 * Configuracion unica del sitio. Todo lo que se repite en header, footer,
 * metadatos y datos estructurados sale de aqui.
 */

export const site = {
  name: "PromoZone",
  legalName: "PromoZone",
  tagline: "Más que promocionales",
  url: "https://promozone.com.mx",
  description:
    "Artículos promocionales personalizados con tu logo en México: termos, tazas, cilindros, textiles, bolígrafos, tecnología, mochilas y llaveros. Cotiza en línea al instante.",
  shortDescription:
    "Artículos promocionales personalizados con tu logo. Cotización inmediata por WhatsApp.",
  locale: "es_MX",
  lang: "es-MX",
  country: "MX",

  /** Numero en formato internacional sin signos, para los enlaces wa.me */
  whatsapp: "5215550746699",
  /** Mismo numero en formato legible */
  phoneDisplay: "+52 55 5074 6699",
  /** Formato E.164 para tel: y datos estructurados */
  phoneE164: "+525550746699",
  email: "ventas@promozone.com.mx",

  /** Zona de servicio declarada en los datos estructurados */
  areaServed: "México",

  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
} as const;

/**
 * Margen aplicado al precio de lista del proveedor antes de mostrarlo.
 *
 * La API de ForPromotional devuelve el precio al que TU compras. Publicarlo
 * tal cual dejaria tu costo a la vista de cualquiera. 1.45 es un valor de
 * arranque: ajustalo con CATALOGO_MARGEN o cambiando el numero de abajo.
 */
export const margenCatalogo = Number(process.env.CATALOGO_MARGEN) || 1.45;

/** Precio de lista del proveedor -> precio publico, redondeado a peso */
export function precioPublico(precioProveedor: number): number {
  return Math.ceil(precioProveedor * margenCatalogo);
}

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Enlaces de navegacion principales, compartidos por header y footer */
export const mainNav = [
  { href: "/", label: "Inicio" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/catalogo", label: "Catálogo completo" },
  { href: "/#como-funciona", label: "Cómo funciona" },
] as const;
