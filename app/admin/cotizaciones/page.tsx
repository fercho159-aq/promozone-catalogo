"use client";

import { useState, useEffect } from "react";

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
}

export default function CotizacionesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then(setQuotes)
      .finally(() => setLoading(false));
  }, []);

  const filtered = quotes.filter(
    (q) =>
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.productName.toLowerCase().includes(search.toLowerCase()) ||
      q.clientPhone.includes(search)
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Cargando cotizaciones...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cotizaciones ({quotes.length})</h1>
        <input
          type="text"
          placeholder="Buscar por nombre, producto o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-80 text-sm text-gray-900"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">{quotes.length === 0 ? "Aún no hay cotizaciones" : "Sin resultados"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Color</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Cant.</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Desc.</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-b border-gray-50 hover:bg-blue-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{q.clientName}</p>
                    {q.clientCompany && <p className="text-xs text-gray-400">{q.clientCompany}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <a href={`https://wa.me/52${q.clientPhone.replace(/\s/g, "")}`} target="_blank" className="text-green-600 hover:underline">
                      {q.clientPhone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{q.productName}</td>
                  <td className="px-4 py-3 text-gray-600">{q.productColor}</td>
                  <td className="px-4 py-3 text-right text-gray-800">{q.quantity}</td>
                  <td className="px-4 py-3 text-right text-green-600">{q.discount > 0 ? `-${q.discount}%` : "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">
                    ${q.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{q.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
