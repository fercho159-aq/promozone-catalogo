import Link from "next/link";
import Logo from "@/components/Logo";
import { categories } from "@/lib/products";
import { site, whatsappLink } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-navy-900 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          {/* marca */}
          <div className="md:col-span-4">
            <Logo variant="onDark" size="md" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
              {site.description}
            </p>
            <a
              href={whatsappLink(`Hola ${site.name}, quiero cotizar artículos promocionales.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
            >
              Cotizar por WhatsApp
            </a>
          </div>

          {/* categorias: enlazado interno para SEO */}
          <nav className="md:col-span-5" aria-labelledby="footer-categorias">
            <h2
              id="footer-categorias"
              className="font-display text-sm font-bold uppercase tracking-wider text-white"
            >
              Categorías
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="transition hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contacto */}
          <div className="md:col-span-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Contacto
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`tel:${site.phoneE164}`} className="transition hover:text-white">
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="transition hover:text-white">
                  {site.email}
                </a>
              </li>
              <li className="text-navy-300">Envíos a todo {site.areaServed}</li>
              <li className="pt-2">
                <Link href="/catalogo" className="transition hover:text-white">
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link href="/#categorias" className="transition hover:text-white">
                  Productos destacados
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-xs text-navy-400 sm:flex-row sm:justify-between">
          <p>
            © {year} {site.legalName}. Todos los derechos reservados.
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
