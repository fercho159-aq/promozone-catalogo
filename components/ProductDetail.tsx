"use client";

import { useState, useRef } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { generateQuotePDF } from "@/lib/generatePDF";
import { site } from "@/lib/site";

// Posicion del logo sobre la foto, por categoria
const logoPositions: Record<string, { top: string; left: string; width: string; height: string }> = {
  termos:    { top: "35%", left: "30%", width: "40%", height: "25%" },
  tazas:     { top: "35%", left: "25%", width: "35%", height: "25%" },
  cilindros: { top: "35%", left: "28%", width: "44%", height: "22%" },
  textiles:  { top: "30%", left: "30%", width: "40%", height: "28%" },
  escritura: { top: "35%", left: "25%", width: "30%", height: "30%" },
  tecnologia:{ top: "25%", left: "30%", width: "35%", height: "25%" },
  bolsas:    { top: "35%", left: "28%", width: "40%", height: "25%" },
  llaveros:  { top: "40%", left: "30%", width: "40%", height: "25%" },
};

export default function ProductDetail({ product }: { product: CatalogProduct }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(100);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [quoteSent, setQuoteSent] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unitPrice = product.price;
  const total = unitPrice * quantity;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQuote = () => {
    if (!name.trim() || !phone.trim()) {
      setError("Ingresa tu nombre y teléfono para continuar.");
      return;
    }
    setError("");

    const message = encodeURIComponent(
      `Hola, soy *${name}*${company ? ` de *${company}*` : ""}.\n` +
      `Tel: ${phone}\n\n` +
      `Quiero cotizar:\n` +
      `📦 *${product.name}* (${product.sku})\n` +
      `🎨 Color: ${selectedColor.name}\n` +
      `📊 Cantidad: ${quantity} piezas\n` +
      `💰 Precio unitario: $${unitPrice.toFixed(2)}\n` +
      `💵 *Total estimado: $${total.toFixed(2)} MXN*\n` +
      `${logoUrl ? "\n📎 Adjunto mi logo por separado" : ""}`
    );

    fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: name,
        clientPhone: phone,
        clientCompany: company,
        productId: product.id,
        productName: product.name,
        productColor: selectedColor.name,
        quantity,
        unitPrice: product.price,
        discount: 0,
        total,
        date: new Date().toLocaleDateString("es-MX"),
      }),
    }).catch(() => {});

    window.open(`https://wa.me/${site.whatsapp}?text=${message}`, "_blank");
    setQuoteSent(true);
  };

  const handleDownloadPDF = () => {
    const doc = generateQuotePDF({
      clientName: name,
      clientPhone: phone,
      clientCompany: company,
      productName: product.name,
      productColor: selectedColor.name,
      quantity,
      unitPrice: product.price,
      discount: 0,
      total,
      date: new Date().toLocaleDateString("es-MX"),
    });
    doc.save(`Cotizacion_${product.name.replace(/\s+/g, "_")}.pdf`);
  };

  const inputClass =
    "w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* imagen + previsualizacion del logo */}
        <div className="relative">
          <div
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white"
            style={{ border: `2px solid ${selectedColor.hex}40` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={`${product.name} en color ${selectedColor.name}`}
              className="relative z-10 h-full w-full object-contain"
            />
            <div
              className="pointer-events-none absolute inset-0 z-20 transition-all duration-500"
              style={{
                backgroundColor: selectedColor.hex,
                mixBlendMode: "color",
                opacity: 0.45,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                backgroundColor: selectedColor.hex,
                mixBlendMode: "multiply",
                opacity: 0.15,
              }}
            />
            {logoUrl && (
              <div
                className="pointer-events-none absolute z-30 flex items-center justify-center"
                style={{ ...(logoPositions[product.categorySlug] || logoPositions.termos) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Vista previa de tu logo"
                  className="object-contain"
                  style={{
                    width: `${logoSize}%`,
                    height: `${logoSize}%`,
                    opacity: 0.88,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border-2 border-dashed border-navy-200 bg-navy-50 p-4">
            <p className="mb-2 text-sm font-semibold text-navy-700">
              Sube tu logo para previsualizarlo
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                {logoUrl ? "Cambiar logo" : "Subir logo"}
              </button>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl(null)}
                  className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-600 transition hover:bg-white"
                >
                  Quitar
                </button>
              )}
            </div>
            {logoUrl && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
                  <span className="text-xs font-medium text-emerald-600">Logo cargado</span>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="tam-logo" className="text-xs text-navy-500">
                    Tamaño:
                  </label>
                  <input
                    id="tam-logo"
                    type="range"
                    min="40"
                    max="150"
                    value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-navy-200 accent-brand-600"
                  />
                  <span className="w-8 text-xs text-navy-500">{logoSize}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* informacion y cotizador */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              {product.category}
            </span>
            <span className="rounded-full bg-navy-100 px-3 py-1 font-mono text-xs text-navy-600">
              SKU {product.sku}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-900">
            {product.name}
          </h1>
          <p className="mt-3 leading-relaxed text-navy-600">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-navy-500">
            <span className="rounded-full bg-navy-100 px-3 py-1">{product.material}</span>
            {product.capacity && (
              <span className="rounded-full bg-navy-100 px-3 py-1">{product.capacity}</span>
            )}
          </div>

          {/* colores */}
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-navy-700">
              Color: <span className="text-brand-600">{selectedColor.name}</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.hex + color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    selectedColor.hex === color.hex
                      ? "scale-110 border-brand-600 shadow-lg"
                      : "border-navy-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Color ${color.name}`}
                  aria-pressed={selectedColor.hex === color.hex}
                />
              ))}
            </div>
          </div>

          {/* cantidad y precio */}
          <div className="mt-6 rounded-xl bg-gradient-to-br from-navy-50 to-cream-100 p-5">
            <h2 className="mb-3 text-sm font-semibold text-navy-700">Cantidad y precio</h2>


            <div className="flex items-center gap-3">
              <label htmlFor="cantidad" className="text-sm text-navy-600">
                Piezas:
              </label>
              <input
                id="cantidad"
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-20 rounded-lg border border-navy-200 px-3 py-2 text-center font-semibold text-navy-900"
              />
            </div>

            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">Precio unitario:</span>
                <span className="font-medium text-navy-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-navy-200 pt-2 font-display text-lg font-bold">
                <span className="text-navy-800">Total:</span>
                <span className="text-brand-600">${total.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>

          {/* formulario */}
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold text-navy-700">Solicitar cotización</h2>
            <input
              type="text"
              placeholder="Tu nombre *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Tu nombre"
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Tu teléfono *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Tu teléfono"
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Empresa (opcional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-label="Empresa"
              className={inputClass}
            />

            {error && (
              <p role="alert" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                {error}
              </p>
            )}

            {!quoteSent ? (
              <button
                onClick={handleQuote}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-3 font-display text-lg font-bold text-white transition-all hover:bg-whatsapp-dark hover:shadow-lg"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.773-6.465-2.088l-.26-.182-3.2.9.83-3.088-.206-.278A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                Cotizar por WhatsApp
              </button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <p className="font-semibold text-emerald-700">
                    ¡Cotización enviada por WhatsApp!
                  </p>
                  <p className="mt-1 text-sm text-emerald-600">
                    Descarga tu cotización en PDF
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3 font-display text-lg font-bold text-white transition-all hover:bg-navy-700 hover:shadow-lg"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF de cotización
                </button>
                <button
                  onClick={() => setQuoteSent(false)}
                  className="w-full rounded-xl border border-navy-200 py-2 text-sm text-navy-600 transition hover:bg-navy-50"
                >
                  Nueva cotización
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
