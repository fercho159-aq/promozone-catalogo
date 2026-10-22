import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

/* ---------------------------------------------------------------------------
   Estructura PASTOR del home:
   P + A  -> Problema
   S      -> ComoFunciona
   T      -> PruebaSocial (en su propio archivo, viene del panel)
   O + R  -> Oferta

   Regla de este archivo: aqui solo se describe lo que el sitio HACE y lo que
   el cliente confirmo. Nada de plazos de entrega, coberturas de envio,
   tiempos de respuesta ni servicios que no se hayan acordado.
--------------------------------------------------------------------------- */

const dolores = [
  {
    titulo: "Llegó tarde",
    texto:
      "El pedido no alcanzó la fecha del evento y los artículos terminaron guardados.",
  },
  {
    titulo: "El logo se ve mal",
    texto:
      "Se eligió una técnica que no va con el material, o el área de impresión no daba para ese diseño.",
  },
  {
    titulo: "Nadie lo usa",
    texto:
      "Se compró por precio, no por a quién iba dirigido. El artículo no tenía nada que ver con tu público.",
  },
];

export function Problema() {
  return (
    <section className="bg-navy-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-onDark">
            Seamos honestos
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            Compraste 500 plumas y siguen en el almacén
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-navy-200">
            Le pasa a muchas empresas. Y casi siempre por una de estas tres
            razones.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {dolores.map((d) => (
            <div
              key={d.titulo}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="font-display text-lg font-bold text-brand-onDark">
                {d.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-200">{d.texto}</p>
            </div>
          ))}
        </div>

        {/* A: amplificar */}
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-brand-600/30 bg-brand-900/20 p-7 text-center">
          <p className="text-lg leading-relaxed text-navy-100">
            Y el costo real nunca es el del artículo. Es el presupuesto que ya
            se gastó, la fecha que no se puede repetir y la impresión que tu
            marca dejó en quien lo recibió.
          </p>
        </div>
      </div>
    </section>
  );
}

// Cada paso describe algo que el sitio hace hoy, nada mas.
const pasos = [
  {
    n: "1",
    titulo: "Elige del catálogo",
    texto:
      "Más de 1,800 artículos, con el inventario y el precio tal como los reporta el proveedor.",
  },
  {
    n: "2",
    titulo: "Sube tu logo y velo puesto",
    texto:
      "Previsualiza tu logo sobre el producto antes de armar la cotización.",
  },
  {
    n: "3",
    titulo: "Arma tu cotización",
    texto:
      "Eliges color y cantidad, y descargas la cotización en PDF desde la misma página.",
  },
  {
    n: "4",
    titulo: "Nos escribes por WhatsApp",
    texto:
      "El mensaje sale con el artículo, el color y la cantidad ya capturados, para seguir la conversación.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-24 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            Cómo funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 md:text-4xl">
            Cuatro pasos, sin sorpresas
          </h2>
          <p className="mt-4 text-navy-500">
            Para que sepas qué vas a pedir antes de hablar con nadie.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {pasos.map((p) => (
            <li
              key={p.n}
              className="relative rounded-2xl border border-navy-100 bg-navy-50/40 p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-extrabold text-white">
                {p.n}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-navy-800">
                {p.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Funciones que ya existen en el sitio. Si se agrega una promesa comercial,
// que salga del cliente.
const incluye = [
  "Catálogo de más de 1,800 artículos con el inventario del proveedor",
  "Previsualización de tu logo sobre el producto",
  "Cotización en PDF descargable desde la página",
  "Envío de la cotización por WhatsApp con un clic",
];

export function Oferta() {
  return (
    <section className="bg-gradient-to-br from-navy-50 to-cream-100 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
              Qué puedes hacer aquí
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 md:text-4xl">
              Arma tu cotización en línea
            </h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              Sin registro: eliges el artículo, el color y la cantidad, y te
              llevas la cotización en PDF.
            </p>

            <ul className="mt-6 space-y-3">
              {incluye.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-navy-700">{i}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* R: respuesta */}
          <div className="rounded-3xl bg-navy-900 p-8 text-center text-white shadow-xl md:p-10">
            <h3 className="font-display text-2xl font-extrabold md:text-3xl">
              ¿Ya sabes qué necesitas?
            </h3>
            <p className="mt-3 text-navy-200">
              Cuéntanos qué artículo, cuántas piezas y para cuándo lo
              necesitas.
            </p>
            <div className="mt-7 space-y-3">
              <a
                href={whatsappLink(
                  `Hola ${site.name}, quiero cotizar artículos promocionales.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-full bg-whatsapp px-6 py-3.5 font-display text-lg font-bold text-white transition hover:bg-whatsapp-dark"
              >
                Escribir por WhatsApp
              </a>
              <Link
                href="/catalogo"
                className="block rounded-full border border-white/25 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Explorar el catálogo
              </Link>
            </div>
            <p className="mt-5 text-xs text-navy-400">{site.phoneDisplay}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
