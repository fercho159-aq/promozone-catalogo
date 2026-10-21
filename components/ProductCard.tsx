import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute bottom-3 left-3 flex gap-1">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.hex}
              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{product.material}</p>
        {product.capacity && (
          <p className="text-xs text-gray-400">{product.capacity}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-700">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
            Cotizar
          </span>
        </div>
      </div>
    </Link>
  );
}
