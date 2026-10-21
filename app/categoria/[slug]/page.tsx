import Link from "next/link";
import { getCategoryBySlug, getProductsByCategory, categories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
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

  const products = getProductsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{category.icon} {category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category.icon} {category.name}
        </h1>
        <p className="text-gray-500 mt-2">{category.description}</p>
        <p className="text-sm text-gray-400 mt-1">{products.length} productos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Other categories */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Otras Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== slug)
            .map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 px-4 py-2 rounded-full text-sm text-gray-700 hover:text-blue-700 transition"
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
