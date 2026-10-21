"use client";

import { useState, useEffect } from "react";
import { products as defaultProducts, categories } from "@/lib/products";
import type { Product } from "@/lib/products";

interface EditableProduct extends Product {
  active: boolean;
}

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EditableProduct>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    // Load products: first try stored, fallback to defaults
    fetch("/api/products")
      .then((r) => r.json())
      .then((stored: EditableProduct[]) => {
        if (stored.length > 0) {
          setProducts(stored);
        } else {
          setProducts(defaultProducts.map((p) => ({ ...p, active: true })));
        }
      })
      .catch(() => {
        setProducts(defaultProducts.map((p) => ({ ...p, active: true })));
      });
  }, []);

  const saveProducts = async (updated: EditableProduct[]) => {
    setSaving(true);
    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: sessionStorage.getItem("admin_auth") === "true" ? "promo2026" : "",
          products: updated,
        }),
      });
      setProducts(updated);
      setMessage("Productos guardados correctamente");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Error al guardar");
    }
    setSaving(false);
  };

  const startEdit = (product: EditableProduct) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.name || !editForm.price) return;
    const updated = products.map((p) =>
      p.id === editingId ? { ...p, ...editForm } as EditableProduct : p
    );
    saveProducts(updated);
    setEditingId(null);
    setEditForm({});
  };

  const toggleActive = (id: string) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
  };

  const addProduct = () => {
    const newId = `prod_${Date.now()}`;
    const newProduct: EditableProduct = {
      id: newId,
      name: editForm.name || "Nuevo Producto",
      category: editForm.category || "Termos",
      categorySlug: editForm.categorySlug || "termos",
      description: editForm.description || "",
      price: editForm.price || 100,
      colors: [{ name: "Negro", hex: "#1a1a1a" }],
      material: editForm.material || "",
      capacity: editForm.capacity || "",
      image: "/products/termo-niza.jpeg",
      active: true,
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);
    setShowAdd(false);
    setEditForm({});
  };

  const filtered = filterCategory
    ? products.filter((p) => p.categorySlug === filterCategory)
    : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos ({products.length})</h1>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Agregar Producto
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {message}
        </div>
      )}

      {/* Add product form */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-2 border-blue-200">
          <h2 className="font-bold text-gray-800 mb-4">Agregar Nuevo Producto</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              placeholder="Nombre"
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
            />
            <select
              onChange={(e) => {
                const cat = categories.find((c) => c.slug === e.target.value);
                setEditForm({ ...editForm, categorySlug: e.target.value, category: cat?.name || "" });
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <input
              placeholder="Precio"
              type="number"
              onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
            />
            <input
              placeholder="Material"
              onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
            />
            <input
              placeholder="Descripción"
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm col-span-2 text-gray-900"
            />
            <input
              placeholder="Capacidad (opcional)"
              onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
            />
            <div className="flex gap-2">
              <button onClick={addProduct} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                Guardar
              </button>
              <button onClick={() => { setShowAdd(false); setEditForm({}); }} className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-600">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoría</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Material</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!product.active ? "opacity-50" : ""}`}>
                {editingId === product.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="border border-blue-300 rounded px-2 py-1 w-full text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editForm.categorySlug || ""}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.slug === e.target.value);
                          setEditForm({ ...editForm, categorySlug: e.target.value, category: cat?.name || "" });
                        }}
                        className="border border-blue-300 rounded px-2 py-1 text-sm text-gray-700"
                      >
                        {categories.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editForm.price || 0}
                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="border border-blue-300 rounded px-2 py-1 w-20 text-right text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={editForm.material || ""}
                        onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                        className="border border-blue-300 rounded px-2 py-1 w-full text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">—</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={saveEdit} className="text-green-600 font-medium hover:underline mr-2">Guardar</button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:underline">Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          {product.capacity && <p className="text-xs text-gray-400">{product.capacity}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{product.material}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(product.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => startEdit(product)} className="text-blue-600 hover:underline text-xs mr-2">
                        Editar
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:underline text-xs">
                        Eliminar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Guardando...
        </div>
      )}
    </div>
  );
}
