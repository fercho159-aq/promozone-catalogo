"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Contenido, Promocion } from "@/lib/contenido";

const CLAVE = "pz_promo_vista";

/**
 * Ventana emergente con las promociones del mes. Solo en escritorio y una vez
 * por sesion: en movil ya hay un banner de promocion dentro del menu.
 */
export default function PromoModal({
  modal,
  promociones,
}: {
  modal: Contenido["modal"];
  promociones: Promocion[];
}) {
  const [abierto, setAbierto] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!modal.activo || promociones.length === 0) return;

    // en movil el menu ya muestra la promocion
    if (window.matchMedia("(max-width: 767px)").matches) return;

    try {
      if (sessionStorage.getItem(CLAVE) === "1") return;
    } catch {
      // modo privado o cookies bloqueadas: se muestra igual
    }

    const t = setTimeout(() => setAbierto(true), 1200);
    return () => clearTimeout(t);
  }, [modal.activo, promociones.length]);

  useEffect(() => {
    if (!abierto) return;
    cerrarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  function cerrar() {
    setAbierto(false);
    try {
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      // sin almacenamiento, se volvera a mostrar: es aceptable
    }
  }

  if (!abierto) return null;

  const principal = promociones[0];
  const resto = promociones.slice(1, 4);

  return (
    <div
      className="fixed inset-0 z-[100] hidden items-center justify-center bg-navy-950/70 p-4 md:flex"
      onClick={cerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-titulo"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <button
          ref={cerrarRef}
          onClick={cerrar}
          aria-label="Cerrar promociones"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-600 shadow transition hover:bg-white hover:text-navy-900"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2">
          {/* imagen */}
          <div className="relative min-h-[240px] bg-navy-800">
            {principal.imagen ? (
              <Image
                src={principal.imagen}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-navy-700 to-navy-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              {principal.etiqueta && (
                <span className="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {principal.etiqueta}
                </span>
              )}
              <p className="mt-2 font-display text-2xl font-extrabold leading-tight">
                {principal.titulo}
              </p>
            </div>
          </div>

          {/* contenido */}
          <div className="flex flex-col p-7">
            <h2
              id="promo-titulo"
              className="font-display text-xl font-extrabold text-navy-900"
            >
              {modal.titulo}
            </h2>
            {modal.texto && (
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {modal.texto}
              </p>
            )}

            <p className="mt-4 text-sm leading-relaxed text-navy-700">
              {principal.texto}
            </p>
            {principal.vigencia && (
              <p className="mt-2 text-xs font-medium text-brand-600">
                {principal.vigencia}
              </p>
            )}

            {resto.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-navy-100 pt-4">
                {resto.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.enlace || "/catalogo"}
                      onClick={cerrar}
                      className="flex items-start gap-2 text-sm text-navy-600 transition hover:text-brand-600"
                    >
                      <span className="mt-0.5 text-brand-500" aria-hidden="true">
                        •
                      </span>
                      <span>
                        <span className="font-medium">{p.titulo}</span>
                        {p.vigencia && (
                          <span className="block text-xs text-navy-400">
                            {p.vigencia}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto space-y-2 pt-6">
              <Link
                href={principal.enlace || "/catalogo"}
                onClick={cerrar}
                className="block rounded-full bg-brand-600 px-5 py-3 text-center font-display font-bold text-white transition hover:bg-brand-700"
              >
                {principal.cta || "Ver promoción"}
              </Link>
              <button
                onClick={cerrar}
                className="w-full rounded-full px-5 py-2 text-sm text-navy-400 transition hover:text-navy-700"
              >
                Ahora no, gracias
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
