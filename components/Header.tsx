"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { categories } from "@/lib/products";
import { site, whatsappLink } from "@/lib/site";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  // al navegar, el clic en el enlace burbujea hasta el contenedor y cierra el menu
  const closeAll = () => {
    setMenuOpen(false);
    setCatsOpen(false);
  };

  // Escape y click fuera cierran el desplegable de categorias
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCatsOpen(false);
        setMenuOpen(false);
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

  // bloquea el scroll del body con el menu movil abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-navy-800 text-white shadow-lg shadow-navy-950/20">
      {/* barra superior de contacto, solo desktop */}
      <div className="hidden border-b border-white/10 bg-navy-900 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-navy-200">
          <p>Personalizamos con tu logo · Envíos a todo {site.areaServed}</p>
          <div className="flex items-center gap-5">
            <a href={`tel:${site.phoneE164}`} className="transition hover:text-white">
              {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="transition hover:text-white">
              {site.email}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        <Logo variant="onDark" size="md" />

        {/* navegacion desktop */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link
            href="/"
            onClick={closeAll}
            className="rounded-lg px-3 py-2 transition hover:bg-white/10"
          >
            Inicio
          </Link>

          <div className="relative" ref={catsRef}>
            <button
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition hover:bg-white/10"
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
                className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-navy-100 bg-white py-2 shadow-2xl"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    className="flex items-start gap-3 px-4 py-2.5 transition hover:bg-navy-50"
                  >
                    <span className="text-xl leading-none" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-navy-800">{cat.name}</span>
                      <span className="block text-xs text-navy-400">{cat.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/catalogo"
            onClick={closeAll}
            className="rounded-lg px-3 py-2 transition hover:bg-white/10"
          >
            Catálogo completo
          </Link>

          <Link
            href="/#por-que-nosotros"
            className="rounded-lg px-3 py-2 transition hover:bg-white/10"
          >
            Por qué nosotros
          </Link>

          <a
            href={whatsappLink(`Hola ${site.name}, quiero cotizar artículos promocionales.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon />
            Cotizar
          </a>
        </nav>

        {/* boton movil */}
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

      {/* menu movil */}
      {menuOpen && (
        <div
          id="menu-movil"
          onClick={closeAll}
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-navy-800 px-4 py-4 md:hidden"
        >
          <Link href="/" className="block rounded-lg px-3 py-2.5 font-medium transition hover:bg-white/10">
            Inicio
          </Link>

          <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-navy-300">
            Categorías
          </p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/10"
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>

          <Link
            href="/catalogo"
            className="mt-3 block rounded-lg px-3 py-2.5 font-medium transition hover:bg-white/10"
          >
            Catálogo completo
          </Link>

          <Link
            href="/#por-que-nosotros"
            className="block rounded-lg px-3 py-2.5 font-medium transition hover:bg-white/10"
          >
            Por qué nosotros
          </Link>

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
