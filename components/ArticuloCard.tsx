import Image from "next/image";
import Link from "next/link";
import type { ArticuloCatalogo } from "@/lib/unificado";

export default function ArticuloCard({
  articulo,
}: {
  articulo: ArticuloCatalogo;
}) {
  return (
    <Link
      href={`/catalogo/${articulo.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white p-4">
        {articulo.imagen ? (
          <Image
            src={articulo.imagen}
            alt={`${articulo.nombre} personalizable con logo`}
            width={320}
            height={320}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-xs text-navy-300">Sin imagen</span>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {articulo.nuevo && (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white">
              Nuevo
            </span>
          )}
          {articulo.promocion && (
            <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white">
              Promoción
            </span>
          )}
        </div>

        {articulo.inventario <= 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-navy-100 px-2 py-0.5 text-[0.6rem] font-semibold text-navy-500">
            Sobre pedido
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-navy-50 p-4">
        <p className="font-mono text-[0.65rem] text-navy-400">{articulo.codigo}</p>
        <h3 className="mt-0.5 line-clamp-2 font-display font-bold text-navy-800 transition-colors group-hover:text-brand-600">
          {articulo.nombre}
        </h3>
        <p className="mt-1 text-xs text-navy-400">{articulo.subcategoria}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-lg font-extrabold text-navy-800">
            ${articulo.precio.toLocaleString("es-MX")}
            <span className="ml-1 text-xs font-medium text-navy-400">MXN</span>
          </span>
          {articulo.colores.length > 1 && (
            <span className="rounded-full bg-navy-50 px-2 py-1 text-[0.65rem] font-medium text-navy-500">
              {articulo.colores.length} colores
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
