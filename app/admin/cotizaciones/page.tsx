"use client";

import { useEffect, useMemo, useState } from "react";

interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  clientCompany: string;
  productName: string;
  productColor: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  date: string;
  timestamp?: number;
  origen?: "pdf" | "whatsapp";
}

/** Hasta donde ya se reviso este navegador */
const VISTO_KEY = "promozone:cotizaciones-vistas";

const ORIGENES = {
  pdf: { etiqueta: "PDF", clase: "bg-navy-100 text-navy-700" },
  whatsapp: { etiqueta: "WhatsApp", clase: "bg-emerald-100 text-emerald-700" },
} as const;

function toCsv(rows: Quote[]): string {
  const headers = [
    "Fecha", "Cliente", "Empresa", "Teléfono", "Producto",
    "Color", "Cantidad", "Precio unitario", "Descuento %", "Total", "Origen",
  ];
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((q) =>
    [
      q.date, q.clientName, q.clientCompany, q.clientPhone, q.productName,
      q.productColor, q.quantity, q.unitPrice, q.discount, q.total,
      q.origen ? ORIGENES[q.origen].etiqueta : "",
    ].map(esc).join(","),
  );
  return [headers.map(esc).join(","), ...lines].join("\r\n");
}

export default function CotizacionesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Hasta donde ya se habia revisado ANTES de abrir esta pantalla. Se lee al
  // montar, no dentro del efecto: el efecto deja la marca al dia, y releerla
  // ahi borraria las "nuevas" en cuanto el efecto corriera dos veces.
  const [visto] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(localStorage.getItem(VISTO_KEY)) || 0;
    } catch {
      // navegador sin almacenamiento: simplemente no se marcan nuevas
      return 0;
    }
  });

  useEffect(() => {
    fetch("/api/quotes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const filas: Quote[] = Array.isArray(d) ? d : [];
        try {
          // al abrirlas se dan por revisadas: el aviso del menu se apaga
          const ultima = Math.max(0, ...filas.map((q) => q.timestamp || 0));
          if (ultima > (Number(localStorage.getItem(VISTO_KEY)) || 0)) {
            localStorage.setItem(VISTO_KEY, String(ultima));
            window.dispatchEvent(new Event("promozone:cotizaciones-vistas"));
          }
        } catch {
          // sin almacenamiento no hay nada que marcar
        }
        setQuotes(filas);
      })
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter(
      (x) =>
        x.clientName?.toLowerCase().includes(q) ||
        x.productName?.toLowerCase().includes(q) ||
        x.clientCompany?.toLowerCase().includes(q) ||
        x.clientPhone?.includes(q),
    );
  }, [quotes, search]);

  const totals = useMemo(
    () => ({
      count: filtered.length,
      value: filtered.reduce((s, q) => s + (q.total || 0), 0),
    }),
    [filtered],
  );

  const nuevas = useMemo(
    () => quotes.filter((q) => (q.timestamp || 0) > visto).length,
    [quotes, visto],
  );

  async function borrar(q: Quote) {
    if (!confirm(`¿Eliminar la cotización de ${q.clientName}?`)) return;
    try {
      const r = await fetch("/api/quotes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: q.id }),
      });
      if (!r.ok) throw new Error("No se pudo eliminar");
      setQuotes((prev) => prev.filter((x) => x.id !== q.id));
    } catch {
      alert("No se pudo eliminar la cotización");
    }
  }

  function downloadCsv() {
    // BOM para que Excel en español respete los acentos
    const blob = new Blob(["﻿" + toCsv(filtered)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizaciones-promozone-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-navy-400">
        Cargando cotizaciones…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-navy-900">
            Cotizaciones ({quotes.length})
            {nuevas > 0 && (
              <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
                {nuevas} {nuevas === 1 ? "nueva" : "nuevas"}
              </span>
            )}
          </h1>
          <p className="text-sm text-navy-500">
            {totals.count} en pantalla · $
            {totals.value.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Buscar por cliente, empresa, producto o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-300"
          />
          <button
            onClick={downloadCsv}
            disabled={filtered.length === 0}
            className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow">
          <p className="mb-3 text-4xl" aria-hidden="true">
            📋
          </p>
          <p className="text-navy-500">
            {quotes.length === 0 ? "Aún no hay cotizaciones" : "Sin resultados"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-navy-100 bg-navy-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Teléfono</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Producto</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Color</th>
                  <th className="px-4 py-3 text-right font-semibold text-navy-600">Cant.</th>
                  <th className="px-4 py-3 text-right font-semibold text-navy-600">Desc.</th>
                  <th className="px-4 py-3 text-right font-semibold text-navy-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Origen</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Fecha</th>
                  <th className="px-4 py-3 text-center font-semibold text-navy-600"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-navy-50 hover:bg-navy-50/60">
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-2 font-medium text-navy-800">
                        {q.clientName}
                        {(q.timestamp || 0) > visto && (
                          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                            Nuevo
                          </span>
                        )}
                      </p>
                      {q.clientCompany && (
                        <p className="text-xs text-navy-400">{q.clientCompany}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/52${q.clientPhone?.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        {q.clientPhone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-navy-800">{q.productName}</td>
                    <td className="px-4 py-3 text-navy-600">{q.productColor}</td>
                    <td className="px-4 py-3 text-right text-navy-800">{q.quantity}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {q.discount > 0 ? `-${q.discount}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-600">
                      ${q.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      {q.origen ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ORIGENES[q.origen].clase}`}
                        >
                          {ORIGENES[q.origen].etiqueta}
                        </span>
                      ) : (
                        <span className="text-navy-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-500">{q.date}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => borrar(q)}
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
