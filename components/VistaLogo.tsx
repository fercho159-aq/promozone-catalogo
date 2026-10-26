"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PosicionLogo } from "@/lib/composicion";

const MAX_MB = 5;
const FORMATOS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export interface LogoCargado {
  url: string;
  nombre: string;
}

/**
 * Muestra el producto y, si el visitante sube su logo, lo deja encima para
 * moverlo y cambiarle el tamano. El archivo no sale del navegador.
 */
export default function VistaLogo({
  imagen,
  alt,
  logo,
  posicion,
  onLogo,
  onPosicion,
}: {
  imagen: string;
  alt: string;
  logo: LogoCargado | null;
  posicion: PosicionLogo;
  onLogo: (l: LogoCargado | null) => void;
  onPosicion: (p: PosicionLogo) => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);

  function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    if (!FORMATOS.includes(file.type)) {
      setError("Usa una imagen PNG, JPG, WEBP o SVG.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen pesa más de ${MAX_MB} MB.`);
      return;
    }

    setError("");
    if (logo) URL.revokeObjectURL(logo.url);
    onLogo({ url: URL.createObjectURL(file), nombre: file.name });
    onPosicion({ x: 0.5, y: 0.5, escala: 0.3 });
  }

  function quitar() {
    if (logo) URL.revokeObjectURL(logo.url);
    onLogo(null);
    setError("");
  }

  function mover(e: React.PointerEvent) {
    if (!arrastrando || !caja.current) return;
    const r = caja.current.getBoundingClientRect();
    const dentro = (v: number) => Math.min(1, Math.max(0, v));
    onPosicion({
      ...posicion,
      x: dentro((e.clientX - r.left) / r.width),
      y: dentro((e.clientY - r.top) / r.height),
    });
  }

  return (
    <div>
      <div
        ref={caja}
        onPointerMove={mover}
        onPointerUp={() => setArrastrando(false)}
        onPointerLeave={() => setArrastrando(false)}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-navy-100 bg-white p-6"
      >
        {imagen ? (
          <Image
            src={imagen}
            alt={alt}
            width={700}
            height={700}
            priority
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-sm text-navy-300">Sin imagen disponible</span>
        )}

        {logo && imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.url}
            alt="Tu logo sobre el producto"
            draggable={false}
            onPointerDown={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            style={{
              left: `${posicion.x * 100}%`,
              top: `${posicion.y * 100}%`,
              width: `${posicion.escala * 100}%`,
              touchAction: "none",
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 select-none object-contain ${
              arrastrando ? "cursor-grabbing" : "cursor-grab"
            }`}
          />
        )}
      </div>

      {imagen && (
        <div className="mt-3 rounded-xl border border-navy-100 bg-navy-50/60 p-3">
          {!logo ? (
            <>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 bg-white px-4 py-3 text-sm font-semibold text-navy-700 transition hover:border-brand-500 hover:text-brand-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Sube tu logo y velo puesto
                <input
                  type="file"
                  accept={FORMATOS.join(",")}
                  onChange={elegir}
                  className="sr-only"
                />
              </label>
              <p className="mt-2 text-center text-xs text-navy-400">
                PNG, JPG, WEBP o SVG. Tu archivo no se sube a ningún lado: solo
                se usa aquí para que veas cómo queda.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-navy-700" title={logo.nombre}>
                  {logo.nombre}
                </p>
                <button
                  onClick={quitar}
                  className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
                >
                  Quitar
                </button>
              </div>
              <label className="mt-3 block text-xs font-semibold text-navy-600">
                Tamaño
                <input
                  type="range"
                  min={8}
                  max={70}
                  value={Math.round(posicion.escala * 100)}
                  onChange={(e) =>
                    onPosicion({ ...posicion, escala: Number(e.target.value) / 100 })
                  }
                  className="mt-1 w-full accent-brand-600"
                />
              </label>
              <p className="text-center text-xs text-navy-400">
                Arrastra el logo para acomodarlo. Así se verá en tu cotización.
              </p>
            </>
          )}

          {error && (
            <p role="alert" className="mt-2 text-center text-xs font-medium text-brand-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
