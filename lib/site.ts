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

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Enlaces de navegacion principales, compartidos por header y footer */
export const mainNav = [
  { href: "/", label: "Inicio" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/#por-que-nosotros", label: "Por qué nosotros" },
] as const;
