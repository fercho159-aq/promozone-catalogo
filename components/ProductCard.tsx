import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-navy-50 to-cream-100 p-5">
        <Image
          src={product.image}
          alt={`${product.name} personalizable con logo`}
          width={320}
          height={320}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          className="h-3/4 w-3/4 object-contain transition-transform duration-300 group-hover:scale-110"
        />
        {product.colors.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.hex + color.name}
                className="h-4 w-4 rounded-full border border-white/80 shadow-sm ring-1 ring-navy-200"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="rounded-full bg-white/90 px-1.5 text-[0.6rem] font-semibold leading-4 text-navy-600">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-bold text-navy-800 transition-colors group-hover:text-brand-600">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-navy-500">{product.material}</p>
        {product.capacity && (
          <p className="text-xs text-navy-400">{product.capacity}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-lg font-extrabold text-navy-800">
            ${product.price.toFixed(2)}
            <span className="ml-1 text-xs font-medium text-navy-400">MXN</span>
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            Cotizar
          </span>
        </div>
      </div>
    </Link>
  );
}
