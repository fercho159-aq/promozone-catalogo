import type { Metadata } from "next";
import Link from "next/link";
import Galeria from "@/components/Galeria";
import { getContenidoPublico } from "@/lib/contenido";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

const TITULO = "Textiles y proyectos especiales";

export const metadata: Metadata = {
  title: TITULO,
  description:
    "Galería de textiles y proyectos especiales personalizados con el logo de nuestros clientes: uniformes, playeras, gorras y desarrollos a la medida.",
  alternates: { canonical: "/textiles-y-proyectos-especiales" },
  openGraph: {
    type: "website",
    title: `${TITULO} | ${site.name}`,
    description:
      "Textiles y proyectos especiales personalizados con el logo de tu empresa.",
    url: `${site.url}/textiles-y-proyectos-especiales`,
  },
};

export default async function ProyectosPage() {
  const { galeria } = await getContenidoPublico();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: TITULO,
        item: `${site.url}/textiles-y-proyectos-especiales`,
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
        <span className="font-medium text-navy-700">{TITULO}</span>
      </nav>

      <header className="mb-8 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-8 text-white">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          Textiles y <span className="text-brand-onDark">proyectos especiales</span>
        </h1>
        {/*
          El texto no afirma autoria de las fotos: mientras sean imagenes de
          muestra, decir "trabajos que hicimos" seria falso. Sirve igual
          cuando se sustituyan por proyectos reales.
        */}
        <p className="mt-2 max-w-2xl text-navy-200">
          Textiles, uniformes y desarrollos a la medida. Si traes una idea
          fuera de catálogo, mándanos la referencia y la cotizamos.
        </p>
        <a
          href={whatsappLink(
            `Hola ${site.name}, tengo un proyecto especial y quiero cotizarlo.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
        >
          Cuéntanos tu proyecto
        </a>
      </header>

      {galeria.length > 0 ? (
        <Galeria fotos={galeria} />
      ) : (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-16 text-center">
          <p className="font-medium text-navy-700">
            Aún no hay fotos publicadas en esta sección.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-500">
            Mientras tanto, escríbenos y te mandamos ejemplos de lo que hemos
            hecho.
          </p>
          <a
            href={whatsappLink(
              `Hola ${site.name}, quiero ver ejemplos de textiles y proyectos especiales.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
