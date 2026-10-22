import type { Metadata } from "next";
import Link from "next/link";
import ArticuloCard from "@/components/ArticuloCard";
import { buscarEnCatalogo, getCategoriasCatalogo } from "@/lib/unificado";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Catálogo Completo de Artículos Promocionales",
  description:
    "Explora más de 1,800 artículos promocionales personalizables con el logo de tu empresa: bebidas, textiles, oficina, tecnología, ecológicos y más. Cotiza por WhatsApp.",
  alternates: { canonical: "/catalogo" },
  openGraph: {
    type: "website",
    title: `Catálogo Completo | ${site.name}`,
    description:
      "Más de 1,800 artículos promocionales personalizables con el logo de tu empresa.",
    url: `${site.url}/catalogo`,
  },
};

type Params = Promise<{
  q?: string;
  categoria?: string;
  pagina?: string;
}>;

/** Construye un href conservando los filtros activos */
function href(base: { q?: string; categoria?: string; pagina?: number }) {
  const p = new URLSearchParams();
  if (base.q) p.set("q", base.q);
  if (base.categoria) p.set("categoria", base.categoria);
  if (base.pagina && base.pagina > 1) p.set("pagina", String(base.pagina));
  const qs = p.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const categoria = sp.categoria ?? "";
  const pagina = Number(sp.pagina) || 1;

  const [resultado, categorias] = await Promise.all([
    buscarEnCatalogo({ q, categoria, pagina }),
    getCategoriasCatalogo(),
  ]);

  const { items, total, totalGeneral, totalPaginas } = resultado;
  const actual = resultado.pagina;
  const catActiva = categorias.find((c) => c.slug === categoria);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catálogo completo",
        item: `${site.url}/catalogo`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-navy-400">
        <Link href="/" className="transition hover:text-brand-600">
          Inicio
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="font-medium text-navy-700">Catálogo completo</span>
      </nav>

      <header className="mb-8 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-8 text-white">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          Catálogo <span className="text-brand-onDark">completo</span>
        </h1>
        <p className="mt-2 max-w-2xl text-navy-200">
          {totalGeneral.toLocaleString("es-MX")} artículos promocionales listos
          para personalizar con el logo de tu empresa. Busca el que necesitas y
          cotízalo por WhatsApp.
        </p>
      </header>

      {/* buscador: formulario GET, funciona sin JavaScript */}
      <form method="get" action="/catalogo" className="mb-5 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, código o material…"
          aria-label="Buscar en el catálogo"
          className="min-w-[240px] flex-1 rounded-lg border border-navy-200 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <button className="rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700">
          Buscar
        </button>
        {(q || categoria) && (
          <Link
            href="/catalogo"
            className="rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-600 transition hover:bg-navy-50"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* categorias */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={href({ q })}
          className={`rounded-full px-3.5 py-1.5 text-sm transition ${
            !categoria
              ? "bg-navy-800 text-white"
              : "border border-navy-200 bg-white text-navy-700 hover:border-brand-400 hover:text-brand-700"
          }`}
        >
          Todas ({totalGeneral.toLocaleString("es-MX")})
        </Link>
        {categorias.map((c) => (
          <Link
            key={c.slug}
            href={href({ q, categoria: c.slug })}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              categoria === c.slug
                ? "bg-navy-800 text-white"
                : "border border-navy-200 bg-white text-navy-700 hover:border-brand-400 hover:text-brand-700"
            }`}
          >
            {c.nombre} ({c.total})
          </Link>
        ))}
      </div>

      {totalGeneral === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-16 text-center">
          <p className="font-medium text-navy-700">
            El catálogo del proveedor no está disponible en este momento.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-500">
            Vuelve a intentarlo en unos minutos o escríbenos y te mandamos el
            artículo que buscas.
          </p>
          <a
            href={whatsappLink(`Hola ${site.name}, quiero consultar el catálogo.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
          >
            Escribir por WhatsApp
          </a>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-navy-500">
            {total.toLocaleString("es-MX")}{" "}
            {total === 1 ? "artículo" : "artículos"}
            {catActiva ? ` en ${catActiva.nombre}` : ""}
            {q ? ` para “${q}”` : ""}
            {totalPaginas > 1 ? ` · página ${actual} de ${totalPaginas}` : ""}
          </p>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-16 text-center">
              <p className="text-navy-500">
                No encontramos artículos con esa búsqueda.
              </p>
              <Link
                href="/catalogo"
                className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {items.map((a) => (
                <ArticuloCard key={a.id} articulo={a} />
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginación"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {actual > 1 && (
                <Link
                  href={href({ q, categoria, pagina: actual - 1 })}
                  className="rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition hover:border-brand-400"
                >
                  ← Anterior
                </Link>
              )}

              {paginasVisibles(actual, totalPaginas).map((p, i) =>
                p === null ? (
                  <span key={`gap-${i}`} className="px-1 text-navy-300">
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={href({ q, categoria, pagina: p })}
                    aria-current={p === actual ? "page" : undefined}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      p === actual
                        ? "bg-navy-800 text-white"
                        : "border border-navy-200 bg-white text-navy-700 hover:border-brand-400"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}

              {actual < totalPaginas && (
                <Link
                  href={href({ q, categoria, pagina: actual + 1 })}
                  className="rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition hover:border-brand-400"
                >
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

/** 1 … 4 5 [6] 7 8 … 40 */
function paginasVisibles(actual: number, total: number): (number | null)[] {
  const out: (number | null)[] = [];
  const push = (n: number | null) => out.push(n);
  const cerca = (n: number) => Math.abs(n - actual) <= 2;

  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || cerca(p)) push(p);
    else if (out[out.length - 1] !== null) push(null);
  }
  return out;
}
