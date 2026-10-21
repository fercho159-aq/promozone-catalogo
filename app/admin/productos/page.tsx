"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories } from "@/lib/products";

type Color = { name: string; hex: string };

type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  price: number;
  colors: Color[];
  material: string;
  capacity?: string;
  image: string;
  active: boolean;
};

type SortKey = "name" | "price-asc" | "price-desc" | "category";

const EMPTY: AdminProduct = {
  id: "",
  sku: "",
  name: "",
  category: categories[0].name,
  categorySlug: categories[0].slug,
  description: "",
  price: 0,
  colors: [{ name: "Negro", hex: "#1a1a1a" }],
  material: "",
  capacity: "",
  image: "",
  active: true,
};

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Mismo criterio que deriveSku() en lib/catalog.ts */
function suggestSku(name: string, categorySlug: string): string {
  const cat = (categorySlug || "gen").slice(0, 3).toUpperCase();
  const parts = slugify(name).split("-").filter(Boolean);
  const tail = (parts.length > 1 ? parts.slice(1) : parts)
    .join("")
    .slice(0, 10)
    .toUpperCase();
  return `PZ-${cat}-${tail || "000"}`;
}

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");
  const [sort, setSort] = useState<SortKey>("name");

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: AdminProduct[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => notify("err", "No se pudo cargar el catálogo"))
      .finally(() => setLoading(false));
  }, []);

  function notify(kind: "ok" | "err", text: string) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  }

  async function persist(updated: AdminProduct[], okMessage: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: updated }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al guardar");
      }
      setProducts(updated);
      notify("ok", okMessage);
      return true;
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Error al guardar");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (filterCategory && p.categorySlug !== filterCategory) return false;
      if (filterStatus === "active" && !p.active) return false;
      if (filterStatus === "inactive" && p.active) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, search, filterCategory, filterStatus, sort]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active).length;
    const cats = new Set(products.map((p) => p.categorySlug)).size;
    const avg = products.length
      ? products.reduce((s, p) => s + p.price, 0) / products.length
      : 0;
    return { total: products.length, active, inactive: products.length - active, cats, avg };
  }, [products]);

  function openNew() {
    setEditing({ ...EMPTY, colors: [{ name: "Negro", hex: "#1a1a1a" }] });
    setIsNew(true);
  }

  function openEdit(p: AdminProduct) {
    setEditing({ ...p, colors: p.colors.map((c) => ({ ...c })) });
    setIsNew(false);
  }

  async function handleSubmit(draft: AdminProduct) {
    if (!draft.name.trim()) return notify("err", "El nombre es obligatorio");
    if (!draft.image.trim()) return notify("err", "Sube una imagen del producto");
    if (!(draft.price > 0)) return notify("err", "El precio debe ser mayor a 0");

    let updated: AdminProduct[];
    if (isNew) {
      const base = slugify(draft.name) || `producto-${Date.now()}`;
      let id = base;
      let n = 2;
      while (products.some((p) => p.id === id)) id = `${base}-${n++}`;
      const nuevo: AdminProduct = {
        ...draft,
        id,
        sku: draft.sku.trim() || suggestSku(draft.name, draft.categorySlug),
      };
      updated = [nuevo, ...products];
    } else {
      updated = products.map((p) => (p.id === draft.id ? draft : p));
    }

    const ok = await persist(updated, isNew ? "Producto creado" : "Producto actualizado");
    if (ok) setEditing(null);
  }

  async function toggleActive(p: AdminProduct) {
    await persist(
      products.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)),
      p.active ? "Producto ocultado del sitio" : "Producto publicado",
    );
  }

  async function duplicate(p: AdminProduct) {
    const base = `${p.id}-copia`;
    let id = base;
    let n = 2;
    while (products.some((x) => x.id === id)) id = `${base}-${n++}`;
    await persist(
      [{ ...p, id, name: `${p.name} (copia)`, sku: `${p.sku}-C`, active: false }, ...products],
      "Producto duplicado (queda oculto hasta que lo publiques)",
    );
  }

  async function remove(p: AdminProduct) {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    await persist(products.filter((x) => x.id !== p.id), "Producto eliminado");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900">Productos</h1>
          <p className="text-sm text-navy-500">
            Alta, edición y publicación del catálogo del sitio
          </p>
        </div>
        <button
          onClick={openNew}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nuevo producto
        </button>
      </div>

      {/* resumen */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total" value={stats.total} />
        <Stat label="Publicados" value={stats.active} tone="ok" />
        <Stat label="Ocultos" value={stats.inactive} tone="warn" />
        <Stat label="Categorías" value={stats.cats} />
        <Stat label="Precio promedio" value={`$${stats.avg.toFixed(0)}`} />
      </div>

      {/* filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, SKU o material…"
          className="min-w-[240px] flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700"
        >
          <option value="">Publicados y ocultos</option>
          <option value="active">Solo publicados</option>
          <option value="inactive">Solo ocultos</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700"
        >
          <option value="name">Nombre A-Z</option>
          <option value="category">Categoría</option>
          <option value="price-asc">Precio ↑</option>
          <option value="price-desc">Precio ↓</option>
        </select>
      </div>

      {/* tabla */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {loading ? (
          <p className="p-10 text-center text-navy-400">Cargando catálogo…</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-navy-400">
            No hay productos que coincidan con el filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-navy-100 bg-navy-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Producto</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Categoría</th>
                  <th className="px-4 py-3 text-right font-semibold text-navy-600">Precio</th>
                  <th className="px-4 py-3 text-center font-semibold text-navy-600">Colores</th>
                  <th className="px-4 py-3 text-center font-semibold text-navy-600">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold text-navy-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-navy-50 transition hover:bg-navy-50/60 ${
                      p.active ? "" : "opacity-55"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb src={p.image} alt={p.name} />
                        <div>
                          <p className="font-medium text-navy-800">{p.name}</p>
                          <p className="text-xs text-navy-400">
                            {p.material}
                            {p.capacity ? ` · ${p.capacity}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-500">{p.sku}</td>
                    <td className="px-4 py-3 text-navy-600">{p.category}</td>
                    <td className="px-4 py-3 text-right font-medium text-navy-800">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {p.colors.slice(0, 5).map((c, i) => (
                          <span
                            key={c.hex + i}
                            className="h-4 w-4 rounded-full ring-1 ring-navy-200"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          p.active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-navy-100 text-navy-500 hover:bg-navy-200"
                        }`}
                      >
                        {p.active ? "Publicado" : "Oculto"}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs font-medium text-navy-700 hover:underline"
                      >
                        Editar
                      </button>
                      <span className="mx-2 text-navy-200">|</span>
                      <button
                        onClick={() => duplicate(p)}
                        className="text-xs font-medium text-navy-500 hover:underline"
                      >
                        Duplicar
                      </button>
                      <span className="mx-2 text-navy-200">|</span>
                      <button
                        onClick={() => remove(p)}
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
        )}
      </div>

      <p className="mt-3 text-xs text-navy-400">
        Mostrando {filtered.length} de {products.length} productos
      </p>

      {editing && (
        <ProductModal
          draft={editing}
          isNew={isNew}
          saving={saving}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
          onError={(m) => notify("err", m)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.kind === "ok" ? "bg-emerald-600" : "bg-brand-600"
          }`}
        >
          {toast.text}
        </div>
      )}
      {saving && !toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-navy-800 px-4 py-3 text-sm text-white shadow-xl">
          Guardando…
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-navy-800";
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-navy-400">{label}</p>
      <p className={`font-display text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return <div className="h-10 w-10 rounded bg-navy-100" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="h-10 w-10 rounded bg-navy-50 object-contain"
      unoptimized
    />
  );
}

function ProductModal({
  draft,
  isNew,
  saving,
  onChange,
  onClose,
  onSubmit,
  onError,
}: {
  draft: AdminProduct;
  isNew: boolean;
  saving: boolean;
  onChange: (p: AdminProduct) => void;
  onClose: () => void;
  onSubmit: (p: AdminProduct) => void;
  onError: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) =>
    onChange({ ...draft, [key]: value });

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slugify(draft.name || "producto"));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen");
      set("image", data.url);
    } catch (e) {
      onError(e instanceof Error ? e.message : "No se pudo subir la imagen");
    }
    setUploading(false);
  }

  const field =
    "w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
  const label = "block text-xs font-semibold uppercase tracking-wide text-navy-500 mb-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-navy-900">
            {isNew ? "Nuevo producto" : `Editar: ${draft.name}`}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 transition hover:bg-navy-50"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {/* imagen */}
          <div className="md:col-span-2">
            <span className={label}>Imagen del producto *</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-navy-200 bg-navy-50">
                {draft.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-navy-300">Sin imagen</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
                >
                  {uploading ? "Subiendo…" : draft.image ? "Cambiar imagen" : "Subir imagen"}
                </button>
                <p className="mt-2 text-xs text-navy-400">
                  JPG, PNG, WebP, AVIF o SVG. Máximo 5 MB. Se guarda en Vercel Blob.
                </p>
                <input
                  value={draft.image}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="…o pega una ruta: /products/mi-foto.jpeg"
                  className={`${field} mt-2`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="f-nombre">
              Nombre *
            </label>
            <input
              id="f-nombre"
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                onChange({
                  ...draft,
                  name,
                  sku: isNew && !draft.sku ? "" : draft.sku,
                });
              }}
              placeholder="Termo Niza"
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="f-sku">
              SKU
            </label>
            <div className="flex gap-2">
              <input
                id="f-sku"
                value={draft.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())}
                placeholder="PZ-TER-NIZA"
                className={`${field} font-mono`}
              />
              <button
                type="button"
                onClick={() => set("sku", suggestSku(draft.name, draft.categorySlug))}
                className="whitespace-nowrap rounded-lg border border-navy-200 px-3 text-xs font-medium text-navy-600 transition hover:bg-navy-50"
              >
                Generar
              </button>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="f-cat">
              Categoría *
            </label>
            <select
              id="f-cat"
              value={draft.categorySlug}
              onChange={(e) => {
                const cat = categories.find((c) => c.slug === e.target.value);
                onChange({
                  ...draft,
                  categorySlug: e.target.value,
                  category: cat?.name ?? draft.category,
                });
              }}
              className={field}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="f-precio">
              Precio unitario (MXN) *
            </label>
            <input
              id="f-precio"
              type="number"
              min="0"
              step="0.01"
              value={draft.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="f-material">
              Material
            </label>
            <input
              id="f-material"
              value={draft.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="Acero Inoxidable"
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="f-cap">
              Capacidad / medida
            </label>
            <input
              id="f-cap"
              value={draft.capacity ?? ""}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="500 ml"
              className={field}
            />
          </div>

          <div className="md:col-span-2">
            <label className={label} htmlFor="f-desc">
              Descripción
            </label>
            <textarea
              id="f-desc"
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Termo de acero inoxidable doble pared, mantiene temperatura hasta 12 horas…"
              className={field}
            />
            <p className="mt-1 text-xs text-navy-400">
              Este texto alimenta la descripción SEO de la página del producto.
            </p>
          </div>

          {/* colores */}
          <div className="md:col-span-2">
            <span className={label}>Colores disponibles</span>
            <div className="space-y-2">
              {draft.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : "#000000"}
                    onChange={(e) => {
                      const colors = [...draft.colors];
                      colors[i] = { ...colors[i], hex: e.target.value };
                      set("colors", colors);
                    }}
                    className="h-9 w-12 cursor-pointer rounded border border-navy-200"
                    aria-label={`Color ${i + 1}`}
                  />
                  <input
                    value={c.name}
                    onChange={(e) => {
                      const colors = [...draft.colors];
                      colors[i] = { ...colors[i], name: e.target.value };
                      set("colors", colors);
                    }}
                    placeholder="Nombre del color"
                    className={field}
                  />
                  <input
                    value={c.hex}
                    onChange={(e) => {
                      const colors = [...draft.colors];
                      colors[i] = { ...colors[i], hex: e.target.value };
                      set("colors", colors);
                    }}
                    placeholder="#1a1a1a"
                    className={`${field} w-32 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => set("colors", draft.colors.filter((_, j) => j !== i))}
                    disabled={draft.colors.length === 1}
                    className="rounded-lg px-2 py-1 text-brand-600 transition hover:bg-brand-50 disabled:opacity-30"
                    aria-label="Quitar color"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set("colors", [...draft.colors, { name: "", hex: "#1a1a1a" }])}
              className="mt-2 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 transition hover:bg-navy-50"
            >
              + Agregar color
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              Publicado en el sitio
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-navy-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-600 transition hover:bg-navy-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSubmit(draft)}
            disabled={saving || uploading}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
