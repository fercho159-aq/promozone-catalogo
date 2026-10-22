"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import type { Promocion } from "@/lib/contenido";
import { site, whatsappLink } from "@/lib/site";

export type CategoriaMenu = {
  nombre: string;
  slug: string;
  total: number;
  /** foto del primer articulo de la categoria; puede faltar */
  imagen: string | null;
};

export default function Header({
  categorias,
  promociones,
  mostrarCasos,
}: {
  categorias: CategoriaMenu[];
  promociones: Promocion[];
  /** el enlace solo aparece si hay casos o testimonios publicados */
  mostrarCasos: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  const promo = promociones[0];
  const closeAll = () => {
    setMenuOpen(false);
    setCatsOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setCatsOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setCatsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // el panel movil ocupa la pantalla: se bloquea el scroll de atras
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-navy-800 text-white shadow-lg shadow-navy-950/20">
      {/* barra de contacto */}
      <div className="hidden border-b border-white/10 bg-navy-900 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-navy-200">
          <p>{site.avisoBarra}</p>
          <div className="flex items-center gap-5">
            <a href={`tel:${site.phoneE164}`} className="transition hover:text-white">
              {site.phoneDisplay}
            </a>
            {site.email && (
              <a href={`mailto:${site.email}`} className="transition hover:text-white">
                {site.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Logo variant="onDark" size="md" />

        <nav className="hidden items-center justify-center gap-1 text-sm font-medium md:flex">
          <Link
            href="/"
            onClick={closeAll}
            className="rounded-lg px-3 py-2 transition hover:bg-white/10"
          >
            Inicio
          </Link>

          {/* mega menu */}
          <div ref={catsRef}>
            <button
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                catsOpen ? "bg-white/10" : "hover:bg-white/10"
              }`}
            >
              Categorías
              <svg
                className={`h-4 w-4 transition-transform ${catsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catsOpen && (
              <div
                onClick={closeAll}
                className="absolute inset-x-0 top-full z-50 border-t border-white/10 bg-white shadow-2xl"
              >
                <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
                  <div className="grid grid-cols-4 gap-3">
                    {categorias.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/catalogo?categoria=${cat.slug}`}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-navy-100 hover:bg-navy-50"
                      >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-navy-50 to-cream-100">
                          {cat.imagen && (
                            <Image
                              src={cat.imagen}
                              alt=""
                              width={56}
                              height={56}
                              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-navy-800 transition-colors group-hover:text-brand-600">
                            {cat.nombre}
                          </span>
                          <span className="block text-xs text-navy-400">
                            {cat.total} artículos
                          </span>
                        </span>
                      </Link>
                    ))}

                    <Link
                      href="/catalogo"
                      className="col-span-4 mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-navy-200 py-3 text-sm font-semibold text-navy-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                    >
                      Ver todo el catálogo →
                    </Link>
                  </div>

                  {/* promocion destacada */}
                  {promo ? (
                    <Link
                      href={promo.enlace || "/catalogo"}
                      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-navy-800 p-5 text-white"
                    >
                      {promo.imagen && (
                        <Image
                          src={promo.imagen}
                          alt=""
                          fill
                          sizes="280px"
                          className="object-cover opacity-35 transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="relative">
                        {promo.etiqueta && (
                          <span className="inline-block rounded-full bg-brand-600 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide">
                            {promo.etiqueta}
                          </span>
                        )}
                        <p className="mt-2 font-display text-lg font-extrabold leading-tight">
                          {promo.titulo}
                        </p>
                        {promo.texto && (
                          <p className="mt-1 text-xs text-navy-100">{promo.texto}</p>
                        )}
                        <span className="mt-3 inline-block text-sm font-semibold text-brand-onDark">
                          {promo.cta || "Ver más"} →
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-navy-50 to-cream-100 p-5">
                      <p className="font-display text-lg font-extrabold text-navy-800">
                        ¿No encuentras algo?
                      </p>
                      <p className="mt-1 text-sm text-navy-500">
                        Tenemos más de 1,800 artículos. Dinos qué buscas y te
                        mandamos opciones.
                      </p>
                      <a
                        href={whatsappLink(
                          `Hola ${site.name}, busco un artículo promocional en particular.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 rounded-full bg-whatsapp px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
                      >
                        Escríbenos
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/textiles-y-proyectos-especiales"
            onClick={closeAll}
            className="rounded-lg px-3 py-2 transition hover:bg-white/10"
          >
            Textiles y proyectos especiales
          </Link>

          {mostrarCasos && (
            <Link
              href="/#casos"
              onClick={closeAll}
              className="rounded-lg px-3 py-2 transition hover:bg-white/10"
            >
              Casos de éxito
            </Link>
          )}

        </nav>

        <a
          href={whatsappLink(`Hola ${site.name}, quiero cotizar artículos promocionales.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-white transition hover:bg-whatsapp-dark md:flex md:justify-self-end"
        >
          <WhatsAppIcon />
          Cotizar
        </a>

        <button
          className="rounded-lg p-2 transition hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* panel vertical en movil */}
      {menuOpen && (
        <div
          id="menu-movil"
          onClick={closeAll}
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-navy-800 pb-6 md:hidden"
        >
          {promo && (
            <Link
              href={promo.enlace || "/catalogo"}
              className="relative block overflow-hidden bg-navy-900 px-4 py-4"
            >
              {promo.imagen && (
                <Image
                  src={promo.imagen}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-30"
                />
              )}
              <div className="relative flex items-center gap-3">
                <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide">
                  {promo.etiqueta || "Promoción"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{promo.titulo}</span>
                  {promo.vigencia && (
                    <span className="block text-[0.7rem] text-navy-200">
                      {promo.vigencia}
                    </span>
                  )}
                </span>
                <span className="text-brand-onDark" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          )}

          <nav className="px-4 pt-4">
            <Link
              href="/"
              className="block rounded-lg px-3 py-3 font-medium transition hover:bg-white/10"
            >
              Inicio
            </Link>

            <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-navy-300">
              Categorías
            </p>
            <ul className="mt-2 space-y-1">
              {categorias.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                      {cat.imagen && (
                        <Image
                          src={cat.imagen}
                          alt=""
                          width={44}
                          height={44}
                          className="h-8 w-8 object-contain"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{cat.nombre}</span>
                      <span className="block truncate text-xs text-navy-300">
                        {cat.total} artículos
                      </span>
                    </span>
                    <span className="text-navy-400" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/catalogo"
              className="mt-2 block rounded-lg px-3 py-2.5 text-sm text-navy-200 transition hover:bg-white/10"
            >
              Ver todo el catálogo →
            </Link>

            <Link
              href="/textiles-y-proyectos-especiales"
              className="mt-4 block rounded-lg px-3 py-3 font-medium transition hover:bg-white/10"
            >
              Textiles y proyectos especiales
            </Link>
            {mostrarCasos && (
              <Link
                href="/#casos"
                className="block rounded-lg px-3 py-3 font-medium transition hover:bg-white/10"
              >
                Casos de éxito
              </Link>
            )}

            <a
              href={whatsappLink(`Hola ${site.name}, quiero cotizar artículos promocionales.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-3 font-semibold text-white transition hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon />
              Cotizar por WhatsApp
            </a>
            <a
              href={`tel:${site.phoneE164}`}
              className="mt-2 block rounded-full border border-white/20 px-4 py-3 text-center font-medium transition hover:bg-white/10"
            >
              {site.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.96 11.96 0 0 0 5.723 1.458h.005c6.585 0 11.946-5.36 11.949-11.946 0-3.19-1.24-6.19-3.495-8.445" />
    </svg>
  );
}
