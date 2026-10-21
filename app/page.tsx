import Link from "next/link";
import { categories } from "@/lib/products";
import HeroCarousel from "@/components/HeroCarousel";

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

export default function Home() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-bold text-gray-800">Personaliza tu Producto</h3>
            <p className="text-gray-500 mt-2 text-sm">Sube tu logo y previsualízalo sobre el artículo antes de cotizar</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-gray-800">Descuentos por Volumen</h3>
            <p className="text-gray-500 mt-2 text-sm">Hasta 10% de descuento comprando más de 16 piezas</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-bold text-gray-800">Cotización Inmediata</h3>
            <p className="text-gray-500 mt-2 text-sm">Recibe tu cotización en PDF al instante vía WhatsApp</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Nuestras Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
                  <img
                    src={categoryImages[cat.slug]}
                    alt={cat.name}
                    className="w-2/3 h-2/3 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {cat.icon} {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
