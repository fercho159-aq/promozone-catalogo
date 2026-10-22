import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticuloCard from "@/components/ArticuloCard";
import ArticuloDetalle from "@/components/ArticuloDetalle";
import { getArticuloCatalogo, getRelacionados } from "@/lib/unificado";
import { site } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await getArticuloCatalogo(id);
  if (!a) return { title: "Artículo no encontrado" };

  const title = `${a.nombre} Personalizado — ${a.codigo}`;
  const description =
    `${a.descripcion || `${a.nombre} personalizable con el logo de tu empresa.`} ` +
    `${a.composicion ? `Material: ${a.composicion}. ` : ""}` +
    `Desde $${a.precio.toLocaleString("es-MX")} MXN.`;

  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: `/catalogo/${a.id}` },
    openGraph: {
      type: "website",
      title: `${title} | ${site.name}`,
      description: description.slice(0, 300),
      url: `${site.url}/catalogo/${a.id}`,
      images: a.imagen ? [{ url: a.imagen, alt: a.nombre }] : undefined,
    },
  };
}

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articulo = await getArticuloCatalogo(id);

  if (!articulo) {
    notFound();
  }

  const relacionados = await getRelacionados(articulo);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Catálogo",
            item: `${site.url}/catalogo`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: articulo.nombre,
            item: `${site.url}/catalogo/${articulo.id}`,
          },
        ],
      },
      {
        "@type": "Product",
        name: articulo.nombre,
        sku: articulo.codigo,
        description: articulo.descripcion || undefined,
        image: articulo.imagenes.slice(0, 4),
        category: articulo.categoria,
        material: articulo.composicion || undefined,
        brand: { "@type": "Brand", name: site.name },
        color: articulo.colores.map((c) => c.color).join(", ") || undefined,
        offers: {
          "@type": "Offer",
          url: `${site.url}/catalogo/${articulo.id}`,
          priceCurrency: "MXN",
          price: articulo.precio.toFixed(2),
          availability:
            articulo.inventario > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": `${site.url}/#organization` },
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-navy-400">
        <Link href="/" className="transition hover:text-brand-600">
          Inicio
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link href="/catalogo" className="transition hover:text-brand-600">
          Catálogo
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link
          href={`/catalogo?categoria=${articulo.categoriaSlug}`}
          className="transition hover:text-brand-600"
        >
          {articulo.categoria}
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="font-medium text-navy-700">{articulo.nombre}</span>
      </nav>

      <ArticuloDetalle articulo={articulo} />

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold text-navy-900">
            Artículos similares
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {relacionados.map((a) => (
              <ArticuloCard key={a.id} articulo={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
