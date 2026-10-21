import Image from "next/image";
import type { CasoExito, Testimonio } from "@/lib/contenido";

/**
 * Prueba social: testimonios y casos de exito.
 *
 * El contenido sale del panel y NO trae ejemplos de arranque a proposito.
 * Son declaraciones atribuidas a clientes reales: inventarlas seria publicar
 * testimonios falsos. Mientras no haya nada publicado, estas secciones
 * simplemente no se renderizan.
 */

function Estrellas({ n }: { n: number }) {
  const total = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span
      className="text-brand-500"
      aria-label={`${total} de 5 estrellas`}
      role="img"
    >
      {"★".repeat(total)}
      <span className="text-navy-200">{"★".repeat(5 - total)}</span>
    </span>
  );
}

export function Testimonios({ testimonios }: { testimonios: Testimonio[] }) {
  if (testimonios.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            Lo que dicen
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 md:text-4xl">
            Clientes que ya lo resolvieron
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonios.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-navy-100 bg-navy-50/40 p-6"
            >
              <Estrellas n={t.calificacion} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-navy-700">
                “{t.texto}”
              </blockquote>
              <figcaption className="mt-4 border-t border-navy-100 pt-4">
                <span className="block font-display text-sm font-bold text-navy-800">
                  {t.nombre}
                </span>
                <span className="block text-xs text-navy-400">
                  {[t.puesto, t.empresa].filter(Boolean).join(" · ")}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CasosExito({ casos }: { casos: CasoExito[] }) {
  if (casos.length === 0) return null;

  return (
    <section id="casos" className="scroll-mt-24 bg-navy-50 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            Casos de éxito
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 md:text-4xl">
            Cómo lo resolvimos
          </h2>
        </div>

        <div className="mt-12 space-y-6">
          {casos.map((c, i) => (
            <article
              key={c.id}
              className={`grid overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="relative min-h-[220px] bg-gradient-to-br from-navy-100 to-cream-100">
                {c.imagen && (
                  <Image
                    src={c.imagen}
                    alt={`Caso de éxito: ${c.titulo}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="p-7 md:p-9">
                {c.cliente && (
                  <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {c.cliente}
                  </span>
                )}
                <h3 className="mt-3 font-display text-xl font-extrabold text-navy-900">
                  {c.titulo}
                </h3>

                <dl className="mt-5 space-y-4 text-sm">
                  {c.reto && (
                    <div>
                      <dt className="font-display text-xs font-bold uppercase tracking-wide text-navy-400">
                        El reto
                      </dt>
                      <dd className="mt-1 leading-relaxed text-navy-600">{c.reto}</dd>
                    </div>
                  )}
                  {c.solucion && (
                    <div>
                      <dt className="font-display text-xs font-bold uppercase tracking-wide text-navy-400">
                        Lo que hicimos
                      </dt>
                      <dd className="mt-1 leading-relaxed text-navy-600">
                        {c.solucion}
                      </dd>
                    </div>
                  )}
                  {c.resultado && (
                    <div className="rounded-xl bg-navy-50 p-4">
                      <dt className="font-display text-xs font-bold uppercase tracking-wide text-brand-600">
                        Resultado
                      </dt>
                      <dd className="mt-1 leading-relaxed text-navy-800">
                        {c.resultado}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
