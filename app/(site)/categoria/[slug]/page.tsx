import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories, getCategoryBySlug } from "@/lib/products";
import { getCatalogByCategory } from "@/lib/catalog";
import { site } from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Categoría no encontrada" };

  const title = `${category.name} Personalizados con tu Logo`;
  const description = `${category.description}. Artículos promocionales personalizados con el logo de tu empresa. Cotiza ${category.name.toLowerCase()} en línea con ${site.name} y recibe tu PDF al instante.`;

  return {
    title,
    description,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: {
      type: "website",
      title: `${title} | ${site.name}`,
      description,
      url: `${site.url}/categoria/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getCatalogByCategory(slug);

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
            name: category.name,
            item: `${site.url}/categoria/${slug}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: `${category.name} personalizados`,
        description: category.description,
        url: `${site.url}/categoria/${slug}`,
        isPartOf: { "@id": `${site.url}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: `${site.url}/producto/${p.id}`,
          })),
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-navy-400">
        <Link href="/" className="transition hover:text-brand-600">
          Inicio
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="font-medium text-navy-700">
          <span aria-hidden="true">{category.icon}</span> {category.name}
        </span>
      </nav>

      <header className="mb-8 rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-8 text-white">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          <span aria-hidden="true">{category.icon}</span> {category.name}{" "}
          <span className="text-brand-onDark">personalizados</span>
        </h1>
        <p className="mt-2 max-w-2xl text-navy-200">{category.description}</p>
        <p className="mt-1 text-sm text-navy-300">
          {products.length} {products.length === 1 ? "producto" : "productos"}{" "}
          disponibles para personalizar con tu logo
        </p>
      </header>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-16 text-center">
          <p className="text-navy-500">
            Aún no hay productos publicados en esta categoría.
          </p>
          <Link
            href="/#categorias"
            className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Ver otras categorías
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <section className="mt-16" aria-labelledby="otras-categorias">
        <h2
          id="otras-categorias"
          className="font-display text-xl font-bold text-navy-800"
        >
          Otras categorías
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== slug)
            .map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="rounded-full border border-navy-200 bg-white px-4 py-2 text-sm text-navy-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
              >
                <span aria-hidden="true">{cat.icon}</span> {cat.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
