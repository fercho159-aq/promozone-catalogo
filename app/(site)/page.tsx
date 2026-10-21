import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { getCatalog, getCategoriesWithCounts } from "@/lib/catalog";
import { site } from "@/lib/site";

// el catalogo vive en Blob y lo edita el admin: refresco cada 5 min
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Artículos Promocionales Personalizados en México",
  description: site.description,
  alternates: { canonical: "/" },
};

const categoryImages: Record<string, string> = {
  termos: "/products/termo-niza.jpeg",
  tazas: "/products/taza-mabum.jpeg",
  cilindros: "/products/cilindro-odesa.jpeg",
  textiles: "/products/playera-yager.jpeg",
  escritura: "/products/boligrafo-deneb.jpeg",
  tecnologia: "/products/bocina-bluetooth.jpeg",
  bolsas: "/products/mochila-ejecutiva.jpeg",
  llaveros: "/products/llavero-mistral.jpeg",
};

const beneficios = [
  {
    icon: "🎨",
    title: "Personaliza tu producto",
    text: "Sube tu logo y previsualízalo sobre el artículo antes de cotizar.",
  },
  {
    icon: "💰",
    title: "Descuentos por volumen",
    text: "Hasta 10% de descuento a partir de 16 piezas del mismo artículo.",
  },
  {
    icon: "📱",
    title: "Cotización inmediata",
    text: "Recibe tu cotización en PDF al instante y envíala por WhatsApp.",
  },
];

export default async function Home() {
  const [cats, products] = await Promise.all([
    getCategoriesWithCounts(),
    getCatalog(),
  ]);

  const destacados = products.slice(0, 8);

  // ItemList de categorias: ayuda a Google a entender la estructura del catalogo
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

      {/* beneficios */}
      <section
        id="por-que-nosotros"
        className="scroll-mt-24 border-b border-navy-100 bg-white py-14"
      >
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center font-display text-3xl font-extrabold text-navy-900">
            ¿Por qué comprar en {site.name}?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {beneficios.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-navy-100 bg-navy-50/50 p-7 text-center transition hover:border-brand-200 hover:bg-cream-50"
              >
                <div className="text-4xl" aria-hidden="true">
                  {b.icon}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-navy-800">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* categorias */}
      <section id="categorias" className="scroll-mt-24 py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold text-navy-900">
              Nuestras categorías
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-navy-500">
              {products.length} artículos promocionales listos para personalizar con
              el logo de tu empresa.
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
        </div>
      </section>

      {/* destacados */}
      {destacados.length > 0 && (
        <section className="bg-white py-14">
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
    </>
  );
}
