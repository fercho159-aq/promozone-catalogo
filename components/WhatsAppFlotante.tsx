"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Contenido } from "@/lib/contenido";
import { site } from "@/lib/site";

const CLAVE = "pz_flotante_cerrado";

/**
 * Boton flotante de WhatsApp con una burbuja que apela a la fecha de entrega.
 *
 * La urgencia es real: personalizar y producir toma dias habiles, asi que
 * preguntar "para cuando lo necesitas" es cierto y util. A proposito NO hay
 * cuenta regresiva ni "quedan X lugares": seria urgencia inventada.
 */
export default function WhatsAppFlotante({
  config,
}: {
  config: Contenido["flotante"];
}) {
  const [visible, setVisible] = useState(false);
  const [burbuja, setBurbuja] = useState(false);
  const pathname = usePathname();

  // el boton aparece al desplazarse un poco, para no tapar el hero de entrada
  useEffect(() => {
    if (!config.activo) return;
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [config.activo]);

  // la burbuja se abre una vez por sesion, unos segundos despues
  useEffect(() => {
    if (!config.activo || !visible) return;
    try {
      if (sessionStorage.getItem(CLAVE) === "1") return;
    } catch {
      // sin almacenamiento se muestra igual
    }
    const t = setTimeout(() => setBurbuja(true), 2500);
    return () => clearTimeout(t);
  }, [config.activo, visible]);

  function cerrarBurbuja() {
    setBurbuja(false);
    try {
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      // sin almacenamiento volvera a salir en la siguiente carga
    }
  }

  if (!config.activo) return null;

  // el mensaje cambia segun donde esta el visitante
  const mensaje = (() => {
    const url = `${site.url}${pathname}`;
    if (pathname.startsWith("/producto/") || pathname.startsWith("/catalogo/")) {
      return `Hola ${site.name}, me interesa este artículo: ${url}\n¿Para cuándo lo podrían tener listo?`;
    }
    if (pathname.startsWith("/categoria/")) {
      return `Hola ${site.name}, estoy viendo esta categoría: ${url}\nNecesito cotizar para una fecha, ¿me ayudan?`;
    }
    if (pathname.startsWith("/catalogo")) {
      return `Hola ${site.name}, estoy viendo el catálogo y quiero cotizar para una fecha en particular.`;
    }
    return `Hola ${site.name}, quiero cotizar artículos promocionales. ¿Para cuándo podrían tenerlos listos?`;
  })();

  const enlace = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {burbuja && (
        <aside
          aria-label="Mensaje de contacto"
          className="relative max-w-[17rem] rounded-2xl rounded-br-sm border border-navy-100 bg-white p-4 shadow-2xl"
        >
          <button
            onClick={cerrarBurbuja}
            aria-label="Cerrar mensaje"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-navy-300 transition hover:bg-navy-50 hover:text-navy-600"
          >
            ✕
          </button>

          <p className="pr-5 font-display text-sm font-extrabold text-navy-900">
            {config.titulo}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
            {config.texto}
          </p>

          <a
            href={enlace}
            target="_blank"
            rel="noopener noreferrer"
            onClick={cerrarBurbuja}
            className="mt-3 block rounded-full bg-whatsapp px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
          >
            {config.cta}
          </a>
        </aside>
      )}

      <a
        href={enlace}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Escribir a ${site.name} por WhatsApp`}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-xl transition hover:bg-whatsapp-dark hover:shadow-2xl"
      >
        {/* el halo se detiene si el visitante pidio menos movimiento */}
        <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-20 motion-reduce:animate-none" />
        <svg className="relative h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.773-6.465-2.088l-.26-.182-3.2.9.83-3.088-.206-.278A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
      </a>
    </div>
  );
}
