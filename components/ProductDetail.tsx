"use client";

import { useState, useRef, useCallback } from "react";
import type { Product } from "@/lib/products";
import { generateQuotePDF } from "@/lib/generatePDF";

const WHATSAPP_NUMBER = "5215550746699";

function getDiscount(qty: number): number {
  if (qty >= 16) return 10;
  if (qty >= 6) return 5;
  return 0;
}

function getTierLabel(qty: number): string {
  if (qty >= 16) return "16-50 piezas (-10%)";
  if (qty >= 6) return "6-15 piezas (-5%)";
  return "1-5 piezas (precio base)";
}

// Logo position presets per product category
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

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(100);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [quoteSent, setQuoteSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const discount = getDiscount(quantity);
  const unitPrice = product.price * (1 - discount / 100);
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
    if (!name || !phone) {
      alert("Por favor ingresa tu nombre y teléfono");
      return;
    }

    const message = encodeURIComponent(
      `Hola, soy *${name}*${company ? ` de *${company}*` : ""}.\n` +
      `Tel: ${phone}\n\n` +
      `Quiero cotizar:\n` +
      `📦 *${product.name}*\n` +
      `🎨 Color: ${selectedColor.name}\n` +
      `📊 Cantidad: ${quantity} piezas\n` +
      `💰 Precio unitario: $${unitPrice.toFixed(2)}\n` +
      `${discount > 0 ? `🏷️ Descuento: ${discount}%\n` : ""}` +
      `💵 *Total estimado: $${total.toFixed(2)} MXN*\n` +
      `${logoUrl ? "\n📎 Adjunto mi logo por separado" : ""}`
    );

    // Save quote to database
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
        discount,
        total,
        date: new Date().toLocaleDateString("es-MX"),
      }),
    }).catch(() => {});

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
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
      discount,
      total,
      date: new Date().toLocaleDateString("es-MX"),
    });
    doc.save(`Cotizacion_${product.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="relative">
          <div
            className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden bg-white"
            style={{
              border: `2px solid ${selectedColor.hex}40`,
            }}
          >
            {/* Product image */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain relative z-10"
            />
            {/* Color overlay that tints the product */}
            <div
              className="absolute inset-0 z-20 pointer-events-none transition-all duration-500"
              style={{
                backgroundColor: selectedColor.hex,
                mixBlendMode: "color",
                opacity: 0.45,
              }}
            />
            {/* Luminosity layer to preserve details */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                backgroundColor: selectedColor.hex,
                mixBlendMode: "multiply",
                opacity: 0.15,
              }}
            />
            {logoUrl && (
              <div
                className="absolute pointer-events-none z-30 flex items-center justify-center"
                style={{
                  ...(logoPositions[product.categorySlug] || logoPositions.termos),
                }}
              >
                <img
                  src={logoUrl}
                  alt="Tu logo"
                  className="object-contain drop-shadow-lg"
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

          {/* Logo upload */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-sm font-medium text-gray-700 mb-2">
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
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {logoUrl ? "Cambiar Logo" : "Subir Logo"}
              </button>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-100 transition"
                >
                  Quitar
                </button>
              )}
            </div>
            {logoUrl && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <img src={logoUrl} alt="Logo preview" className="w-10 h-10 object-contain" />
                  <span className="text-xs text-green-600 font-medium">Logo cargado</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-500">Tamaño:</label>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-500 w-8">{logoSize}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info & Quote */}
        <div>
          <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">{product.name}</h1>
          <p className="text-gray-600 mt-3">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">{product.material}</span>
            {product.capacity && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">{product.capacity}</span>
            )}
          </div>

          {/* Color Selector */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Color: <span className="text-blue-700">{selectedColor.name}</span>
            </h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor.hex === color.hex
                      ? "border-blue-600 scale-110 shadow-lg"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cantidad y Precio</h3>

            {/* Tier badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: "1-5 pzas", desc: "Precio base", min: 1 },
                { label: "6-15 pzas", desc: "-5%", min: 6 },
                { label: "16-50 pzas", desc: "-10%", min: 16 },
              ].map((tier) => (
                <button
                  key={tier.min}
                  onClick={() => setQuantity(tier.min)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    getDiscount(quantity) === getDiscount(tier.min)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <div>{tier.label}</div>
                  <div className="text-[10px] opacity-80">{tier.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Piezas:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center font-semibold text-gray-900"
              />
              <span className="text-xs text-gray-500">{getTierLabel(quantity)}</span>
            </div>

            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio unitario:</span>
                <span className="font-medium text-gray-900">
                  ${product.price.toFixed(2)}
                  {discount > 0 && (
                    <span className="text-green-600 ml-1">→ ${unitPrice.toFixed(2)}</span>
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Descuento:</span>
                  <span className="text-green-600 font-medium">-{discount}%</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                <span className="text-gray-800">Total:</span>
                <span className="text-blue-700">${total.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Solicitar Cotización</h3>
            <input
              type="text"
              placeholder="Tu nombre *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Tu teléfono *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Empresa (opcional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {!quoteSent ? (
              <button
                onClick={handleQuote}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.773-6.465-2.088l-.26-.182-3.2.9.83-3.088-.206-.278A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
                Cotizar por WhatsApp
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold">
                    ¡Cotización enviada por WhatsApp!
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Descarga tu cotización en PDF
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF de Cotización
                </button>
                <button
                  onClick={() => setQuoteSent(false)}
                  className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
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
