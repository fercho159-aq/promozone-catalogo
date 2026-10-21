import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoModal from "@/components/PromoModal";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import { getCategoriesWithCounts } from "@/lib/catalog";
import { getContenidoPublico } from "@/lib/contenido";
import { categoryImages } from "@/lib/products";

/**
 * Chrome del sitio publico. El panel (/admin) queda fuera de este grupo, asi
 * que no hereda el header fijo ni el footer de marketing.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cats, contenido] = await Promise.all([
    getCategoriesWithCounts(),
    getContenidoPublico(),
  ]);

  const categorias = cats.map((c) => ({
    ...c,
    imagen: categoryImages[c.slug] ?? "/products/termo-niza.jpeg",
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
