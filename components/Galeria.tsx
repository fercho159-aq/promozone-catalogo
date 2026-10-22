"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FotoGaleria } from "@/lib/contenido";

/**
 * Galeria de fotos de "Textiles y proyectos especiales".
 * Solo imagenes: ni precios ni fichas. Al tocar una se abre en grande.
 */
export default function Galeria({ fotos }: { fotos: FotoGaleria[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
      if (e.key === "ArrowRight") setAbierta((i) => (i === null ? null : (i + 1) % fotos.length));
      if (e.key === "ArrowLeft")
        setAbierta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierta, fotos.length]);

  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setAbierta(i)}
            className="group block w-full overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition hover:shadow-xl"
            aria-label={f.titulo || `Ver foto ${i + 1}`}
          >
            <Image
              src={f.url}
              alt={f.titulo || "Proyecto personalizado de PromoZone"}
              width={600}
              height={600}
              sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
              className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
            />
            {f.titulo && (
              <span className="block px-3 py-2.5 text-left text-sm font-medium text-navy-700">
                {f.titulo}
              </span>
            )}
          </button>
        ))}
      </div>

      {abierta !== null && fotos[abierta] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/90 p-4"
          onClick={() => setAbierta(null)}
          role="dialog"
          aria-modal="true"
          aria-label={fotos[abierta].titulo || "Foto ampliada"}
        >
          <button
            onClick={() => setAbierta(null)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ✕
          </button>

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAbierta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length));
                }}
                aria-label="Foto anterior"
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-6"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAbierta((i) => (i === null ? null : (i + 1) % fotos.length));
                }}
                aria-label="Foto siguiente"
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6"
              >
                ›
              </button>
            </>
          )}

          <figure onClick={(e) => e.stopPropagation()} className="max-h-full">
            <Image
              src={fotos[abierta].url}
              alt={fotos[abierta].titulo || "Proyecto personalizado"}
              width={1400}
              height={1400}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            {fotos[abierta].titulo && (
              <figcaption className="mt-3 text-center text-sm text-navy-100">
                {fotos[abierta].titulo}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
