import type { Metadata } from "next";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ArticuloCard from "@/components/ArticuloCard";
import { ComoFunciona, Oferta, Problema } from "@/components/home/Secciones";
import { CasosExito, Testimonios } from "@/components/home/PruebaSocial";
import { getContenidoPublico } from "@/lib/contenido";
import { getCatalogoUnificado } from "@/lib/unificado";
import { site } from "@/lib/site";

// el catalogo vive en Blob y lo edita el admin: refresco cada 5 min
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Artículos Promocionales Personalizados en México",
  description: site.description,
  alternates: { canonical: "/" },
};

/** Cuantos articulos del proveedor se muestran en la portada */
const EN_PORTADA = 24;

export default async function Home() {
  const [contenido, articulos] = await Promise.all([
    getContenidoPublico(),
    getCatalogoUnificado(),
  ]);

  const enPortada = articulos.slice(0, EN_PORTADA);

  return (
    <>
      <HeroCarousel />

      {/*
        El catalogo va primero a proposito: el cliente pidio que al entrar se
        vea el catalogo, sin tener que pasar por la rejilla de categorias.
        Las categorias siguen accesibles desde el menu y el pie de pagina.
      */}
      <section id="catalogo" className="scroll-mt-24 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
              Nuestro catálogo
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 md:text-4xl">
              {articulos.length > 0
                ? `${articulos.length.toLocaleString("es-MX")} artículos para personalizar`
                : "Artículos para personalizar"}
            </h2>
            <p className="mt-4 text-navy-500">
              Busca lo que necesitas y cotízalo con el logo de tu empresa.
            </p>
          </div>

          {/* buscador: formulario GET, funciona sin JavaScript */}
          <form
            method="get"
            action="/catalogo"
            className="mx-auto mt-7 flex max-w-2xl flex-wrap gap-2"
          >
            <input
              type="search"
              name="q"
              placeholder="Buscar por nombre, código o material…"
              aria-label="Buscar en el catálogo"
              className="min-w-[200px] flex-1 rounded-full border border-navy-200 px-5 py-3 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            <button className="rounded-full bg-navy-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700">
              Buscar
            </button>
          </form>

          {enPortada.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {enPortada.map((a) => (
                  <ArticuloCard key={a.id} articulo={a} />
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/catalogo"
                  className="inline-block rounded-full bg-brand-600 px-8 py-3.5 font-display text-lg font-bold text-white transition hover:bg-brand-700"
                >
                  Ver el catálogo completo
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-navy-200 py-14 text-center">
              <p className="text-navy-500">
                El catálogo no está disponible en este momento.
              </p>
              <Link
                href="/catalogo"
                className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Reintentar
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* P + A */}
      <Problema />

      {/* S */}
      <ComoFunciona />


      {/* T */}
      <Testimonios testimonios={contenido.testimonios} />
      <CasosExito casos={contenido.casos} />

      {/* O + R */}
      <Oferta />
    </>
  );
}
