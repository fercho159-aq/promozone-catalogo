"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalQuotes: number;
  totalRevenue: number;
  topProducts: { id: string; name: string; count: number; total: number }[];
  recentQuotes: {
    id: string;
    clientName: string;
    clientPhone: string;
    productName: string;
    quantity: number;
    total: number;
    date: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotes?stats=true")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Total Cotizaciones</p>
          <p className="text-3xl font-bold text-blue-700">{stats.totalQuotes}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Valor Total Cotizado</p>
          <p className="text-3xl font-bold text-green-600">
            ${stats.totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Productos Cotizados</p>
          <p className="text-3xl font-bold text-purple-600">{stats.topProducts.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">🏆 Productos Más Cotizados</h2>
          </div>
          <div className="p-5">
            {stats.topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay cotizaciones</p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.slice(0, 10).map((product, i) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-yellow-100 text-yellow-700" :
                        i === 1 ? "bg-gray-100 text-gray-600" :
                        i === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-gray-50 text-gray-500"
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.count} cotizaciones</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      ${product.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">📋 Cotizaciones Recientes</h2>
          </div>
          <div className="p-5">
            {stats.recentQuotes.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay cotizaciones</p>
            ) : (
              <div className="space-y-3">
                {stats.recentQuotes.slice(0, 8).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{quote.clientName}</p>
                      <p className="text-xs text-gray-400">
                        {quote.productName} x{quote.quantity} — {quote.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-700">
                        ${quote.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400">{quote.clientPhone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
