"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { site, whatsappLink } from "@/lib/site";

const slides = [
  {
    src: "/hero1.jpeg",
    alt: "Artículos promocionales personalizados con logo de empresa",
  },
  {
    src: "/hero2.jpeg",
    alt: "Productos publicitarios impresos con la marca del cliente",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => {
    setCurrent(((i % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden bg-navy-900"
      aria-roledescription="carrusel"
      aria-label="Artículos promocionales destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[460px] md:h-[560px]">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== current}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              quality={80}
              className="object-cover"
            />
            {/* velo de marca: mantiene legible el texto sobre cualquier foto */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/65 to-navy-900/40" />
          </div>
        ))}

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-onDark sm:text-sm">
              {site.tagline}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-6xl">
              Artículos Promocionales{" "}
              <span className="text-brand-onDark">Personalizados</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100 drop-shadow md:text-xl">
              Termos, tazas, textiles, tecnología y más con el logo de tu empresa.
              Cotiza en línea y recibe tu PDF al instante.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href="#categorias"
                className="rounded-full bg-white px-8 py-3.5 font-display text-lg font-bold text-navy-800 shadow-lg transition hover:bg-cream-100"
              >
                Ver catálogo
              </a>
              <a
                href={whatsappLink(
                  `Hola ${site.name}, quiero cotizar artículos promocionales.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-whatsapp px-8 py-3.5 font-display text-lg font-bold text-white shadow-lg transition hover:bg-whatsapp-dark"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === current
                      ? "w-8 bg-brand-onDark"
                      : "w-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Ir a la imagen ${i + 1} de ${slides.length}`}
                  aria-current={i === current}
                />
              ))}
            </div>

            <button
              onClick={() => go(current - 1)}
              className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/40 text-white transition hover:bg-navy-950/70 sm:flex"
              aria-label="Imagen anterior"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => go(current + 1)}
              className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/40 text-white transition hover:bg-navy-950/70 sm:flex"
              aria-label="Imagen siguiente"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
