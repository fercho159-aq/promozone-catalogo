import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { ComoFunciona, Oferta, Problema } from "@/components/home/Secciones";
import { CasosExito, Testimonios } from "@/components/home/PruebaSocial";
import { getCatalog, getCategoriesWithCounts } from "@/lib/catalog";
import { getContenidoPublico } from "@/lib/contenido";
import { categoryImages } from "@/lib/products";
import { site } from "@/lib/site";

// el catalogo vive en Blob y lo edita el admin: refresco cada 5 min
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Artículos Promocionales Personalizados en México",
  description: site.description,
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [cats, products, contenido] = await Promise.all([
    getCategoriesWithCounts(),
    getCatalog(),
    getContenidoPublico(),
  ]);

  const destacados = products.slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Categorías de artículos promocionales",
    itemListElement: cats.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.name,
      url: `${site.url}/categoria/${cat.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroCarousel />

      {/* P + A */}
      <Problema />

      {/* S */}
      <ComoFunciona />

      {/* categorias */}
      <section id="categorias" className="scroll-mt-24 bg-navy-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
              Por dónde empezar
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 md:text-4xl">
              Nuestras categorías
            </h2>
            <p className="mt-4 text-navy-500">
              {products.length} artículos seleccionados y listos para
              personalizar con el logo de tu empresa.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {cats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
              >
                <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-navy-50 to-cream-100 p-7">
                  <Image
                    src={categoryImages[cat.slug] ?? "/products/termo-niza.jpeg"}
                    alt={`Categoría ${cat.name}`}
                    width={240}
                    height={240}
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="h-2/3 w-2/3 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-navy-800/90 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
                    {cat.count}
                  </span>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-display font-bold text-navy-800 transition-colors group-hover:text-brand-600">
                    <span aria-hidden="true">{cat.icon}</span> {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-navy-400">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/catalogo"
              className="inline-block rounded-full border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-700 transition hover:border-brand-400 hover:text-brand-700"
            >
              O explora el catálogo completo, con más de 1,800 artículos →
            </Link>
          </div>
        </div>
      </section>

      {/* destacados */}
      {destacados.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl font-extrabold text-navy-900">
                Productos destacados
              </h2>
              <Link
                href="#categorias"
                className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
              >
                Ver todas las categorías →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {destacados.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* T */}
      <Testimonios testimonios={contenido.testimonios} />
      <CasosExito casos={contenido.casos} />

      {/* O + R */}
      <Oferta />
    </>
  );
}
