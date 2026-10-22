"use client";

import Image from "next/image";
import { useState } from "react";
import type { ArticuloCatalogo } from "@/lib/unificado";
import { site } from "@/lib/site";

export default function ArticuloDetalle({
  articulo,
}: {
  articulo: ArticuloCatalogo;
}) {
  const [imagen, setImagen] = useState(articulo.imagen ?? "");
  const [color, setColor] = useState(articulo.colores[0]?.color ?? "");
  const [cantidad, setCantidad] = useState(10);
  const [enviado, setEnviado] = useState(false);

  const precio = articulo.precio;
  const total = precio * cantidad;

  function cotizar() {
    const mensaje =
      `Hola ${site.name}, quiero cotizar:\n\n` +
      `📦 *${articulo.nombre}*\n` +
      `🔖 Código: ${articulo.codigo}\n` +
      (color ? `🎨 Color: ${color}\n` : "") +
      `📊 Cantidad: ${cantidad} piezas\n` +
      `💵 Estimado: $${total.toLocaleString("es-MX")} MXN`;

    fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Cotización desde catálogo",
        clientPhone: "",
        clientCompany: "",
        productId: articulo.codigo,
        productName: articulo.nombre,
        productColor: color,
        quantity: cantidad,
        unitPrice: precio,
        discount: 0,
        total,
        date: new Date().toLocaleDateString("es-MX"),
      }),
    }).catch(() => {});

    window.open(
      `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
    );
    setEnviado(true);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      {/* galeria */}
      <div>
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-navy-100 bg-white p-6">
          {imagen ? (
            <Image
              src={imagen}
              alt={`${articulo.nombre} — ${articulo.codigo}`}
              width={700}
              height={700}
              priority
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm text-navy-300">Sin imagen disponible</span>
          )}
        </div>

        {articulo.imagenes.length > 1 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {articulo.imagenes.slice(0, 8).map((img) => (
              <button
                key={img}
                onClick={() => setImagen(img)}
                aria-label="Ver esta imagen"
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                  imagen === img ? "border-brand-600" : "border-navy-100 hover:border-navy-300"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* datos y cotizador */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {articulo.categoria}
          </span>
          <span className="rounded-full bg-navy-100 px-3 py-1 font-mono text-xs text-navy-600">
            {articulo.codigo}
          </span>
          {articulo.nuevo && (
            <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase text-white">
              Nuevo
            </span>
          )}
        </div>

        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-900">
          {articulo.nombre}
        </h1>

        {articulo.descripcion && (
          <p className="mt-3 leading-relaxed text-navy-600">{articulo.descripcion}</p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {articulo.composicion && (
            <Dato label="Material" value={articulo.composicion} />
          )}
          {articulo.medidas && <Dato label="Medidas" value={articulo.medidas} />}
          {articulo.capacidad && (
            <Dato label="Capacidad" value={articulo.capacidad} />
          )}
          {articulo.areaImpresion && (
            <Dato label="Área de impresión" value={articulo.areaImpresion} />
          )}
          {articulo.subcategoria && (
            <Dato label="Línea" value={articulo.subcategoria} />
          )}
          <Dato
            label="Disponibilidad"
            value={
              articulo.inventario > 0
                ? `${articulo.inventario.toLocaleString("es-MX")} piezas`
                : "Sobre pedido"
            }
          />
        </dl>

        {articulo.metodosImpresion.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-navy-700">
              Técnicas de personalización
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {articulo.metodosImpresion.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-600"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {articulo.colores.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-navy-700">
              Color: <span className="text-brand-600">{color || "—"}</span>
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {articulo.colores.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setColor(c.color)}
                  aria-pressed={color === c.color}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    color === c.color
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-navy-200 bg-white text-navy-700 hover:border-brand-400"
                  }`}
                >
                  {c.color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* cotizador */}
        <div className="mt-6 rounded-xl bg-gradient-to-br from-navy-50 to-cream-100 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="cant" className="text-sm text-navy-600">
              Piezas:
            </label>
            <input
              id="cant"
              type="number"
              min={1}
              max={5000}
              value={cantidad}
              onChange={(e) =>
                setCantidad(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))
              }
              className="w-24 rounded-lg border border-navy-200 px-3 py-2 text-center font-semibold text-navy-900"
            />
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-600">Precio unitario:</span>
              <span className="font-medium text-navy-900">
                ${precio.toLocaleString("es-MX")}
              </span>
            </div>
            <div className="flex justify-between border-t border-navy-200 pt-2 font-display text-lg font-bold">
              <span className="text-navy-800">Estimado:</span>
              <span className="text-brand-600">
                ${total.toLocaleString("es-MX")} MXN
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs text-navy-400">
            Precio de referencia sin IVA ni personalización. Te confirmamos el
            precio final por WhatsApp.
          </p>
        </div>

        <button
          onClick={cotizar}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-3.5 font-display text-lg font-bold text-white transition hover:bg-whatsapp-dark hover:shadow-lg"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.773-6.465-2.088l-.26-.182-3.2.9.83-3.088-.206-.278A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
          </svg>
          {enviado ? "Abrir WhatsApp de nuevo" : "Cotizar por WhatsApp"}
        </button>
      </div>
    </div>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="mt-0.5 text-navy-700">{value}</dd>
    </div>
  );
}
