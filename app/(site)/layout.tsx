import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoModal from "@/components/PromoModal";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import { getContenidoPublico } from "@/lib/contenido";
import { getCatalogoUnificado, getCategoriasCatalogo } from "@/lib/unificado";

/**
 * Chrome del sitio publico. El panel (/admin) queda fuera de este grupo, asi
 * que no hereda el header fijo ni el footer de marketing.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cats, contenido, articulos] = await Promise.all([
    getCategoriasCatalogo(),
    getContenidoPublico(),
    getCatalogoUnificado(),
  ]);

  // cada categoria toma la foto del primer articulo que tenga imagen
  const categorias = cats.slice(0, 12).map((c) => ({
    nombre: c.nombre,
    slug: c.slug,
    total: c.total,
    imagen:
      articulos.find((a) => a.categoriaSlug === c.slug && a.imagen)?.imagen ?? null,
  }));

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-800"
      >
        Saltar al contenido
      </a>
      <Header
        categorias={categorias}
        promociones={contenido.promociones}
        mostrarCasos={contenido.casos.length > 0 || contenido.testimonios.length > 0}
      />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <PromoModal modal={contenido.modal} promociones={contenido.promociones} />
      <WhatsAppFlotante config={contenido.flotante} />
    </>
  );
}
