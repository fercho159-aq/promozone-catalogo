import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, products as staticProducts } from "@/lib/products";
import { getCatalogProduct, getRelatedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams() {
  // los productos dados de alta en el admin se renderizan bajo demanda
  return staticProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getCatalogProduct(id);
  if (!product) return { title: "Producto no encontrado" };

  const title = `${product.name} Personalizado`;
  const description = `${product.description} Material: ${product.material}. Desde $${product.price.toFixed(
    2,
  )} MXN. Personalízalo con el logo de tu empresa y cotiza al instante.`;

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.id}` },
    openGraph: {
      type: "website",
      title: `${title} | ${site.name}`,
      description,
      url: `${site.url}/producto/${product.id}`,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.categorySlug);
  const related = await getRelatedProducts(product);

  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${site.url}${product.image}`;

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
            name: category?.name ?? "Catálogo",
            item: `${site.url}/categoria/${product.categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: `${site.url}/producto/${product.id}`,
          },
        ],
      },
      {
        "@type": "Product",
        name: product.name,
        sku: product.sku,
        description: product.description,
        image: [imageUrl],
        category: product.category,
        material: product.material,
        brand: { "@type": "Brand", name: site.name },
        color: product.colors.map((c) => c.name).join(", "),
        offers: {
          "@type": "Offer",
          url: `${site.url}/producto/${product.id}`,
          priceCurrency: "MXN",
          price: product.price.toFixed(2),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": `${site.url}/#organization` },
        },
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav aria-label="Ruta de navegación" className="text-sm text-navy-400">
          <Link href="/" className="transition hover:text-brand-600">
            Inicio
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link
            href={`/categoria/${product.categorySlug}`}
            className="transition hover:text-brand-600"
          >
            <span aria-hidden="true">{category?.icon}</span> {category?.name}
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="font-medium text-navy-700">{product.name}</span>
        </nav>
      </div>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <h2 className="font-display text-2xl font-extrabold text-navy-900">
            También te puede interesar
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
