"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ArticuloManual, CatalogoEditable } from "@/lib/unificado";

/**
 * Panel del catalogo unico.
 *
 * Lo que se ve es la mezcla ya resuelta (API + ajustes + articulos propios),
 * pero lo que se guarda es solo la capa editable: los ajustes sobre los
 * articulos de la API y los articulos propios. Asi, cuando el proveedor
 * actualice su catalogo, los cambios siguen aplicando.
 */

type Fila = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  categoriaSlug: string;
  subcategoria: string;
  composicion: string;
  medidas: string | null;
  capacidad: string | null;
  areaImpresion: string | null;
  metodosImpresion: string[];
  precio: number;
  inventario: number;
  nuevo: boolean;
  promocion: boolean;
  imagen: string | null;
  imagenes: string[];
  colores: { color: string; inventario: number; imagen: string | null }[];
  keywords: string;
  origen: "api" | "propio";
  oculto: boolean;
  precioBase: number;
  precioAjustado: number | null;
};

type Categoria = { nombre: string; slug: string; total: number };

const POR_PAGINA = 40;

const campo =
  "w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
const etiqueta =
  "block text-xs font-semibold uppercase tracking-wide text-navy-500 mb-1";

function articuloVacio(categoria: string): ArticuloManual {
  return {
    id: "",
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria,
    subcategoria: "",
    composicion: "",
    medidas: null,
    capacidad: null,
    areaImpresion: null,
    metodosImpresion: [],
    precio: 0,
    inventario: 0,
    nuevo: false,
    promocion: false,
    imagen: null,
    imagenes: [],
    colores: [],
    keywords: "",
    activo: true,
  };
}

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CatalogoAdminPage() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [editable, setEditable] = useState<CatalogoEditable>({
    manuales: [],
    ajustes: {},
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sucio, setSucio] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [filtroOrigen, setFiltroOrigen] = useState<"" | "api" | "propio">("");
  const [filtroEstado, setFiltroEstado] = useState<"" | "visible" | "oculto" | "ajustado">("");
  const [pagina, setPagina] = useState(1);

  const [editando, setEditando] = useState<ArticuloManual | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);


  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const r = await fetch("/api/catalogo");
        if (!r.ok) throw new Error("No se pudo cargar el catálogo");
        const d = await r.json();
        if (!vivo) return;
        setFilas(d.articulos ?? []);
        setEditable(d.editable ?? { manuales: [], ajustes: {} });
        setCategorias(d.categorias ?? []);
      } catch {
        if (vivo) notificar(false, "No se pudo cargar el catálogo");
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  function notificar(ok: boolean, texto: string) {
    setAviso({ ok, texto });
    setTimeout(() => setAviso(null), 4000);
  }

  async function guardar() {
    setGuardando(true);
    try {
      const r = await fetch("/api/catalogo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogo: editable }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Error al guardar");
      }
      // No se vuelve a leer el Blob: tarda unos segundos en devolver lo recien
      // escrito y devolveria la version anterior. El estado local ya refleja
      // los cambios, fila por fila.
      setSucio(false);
      notificar(true, "Catálogo publicado");
    } catch (e) {
      notificar(false, e instanceof Error ? e.message : "Error al guardar");
    }
    setGuardando(false);
  }

  /* ---------------- ajustes sobre articulos de la API ---------------- */

  function ajustar(codigo: string, patch: Record<string, unknown>) {
    setEditable((prev) => {
      const actual = { ...(prev.ajustes[codigo] ?? {}), ...patch };
      // si el ajuste queda vacio, se quita para no guardar basura
      const limpio = Object.fromEntries(
        Object.entries(actual).filter(([, v]) => v !== undefined && v !== null && v !== false && v !== ""),
      );
      const ajustes = { ...prev.ajustes };
      if (Object.keys(limpio).length === 0) delete ajustes[codigo];
      else ajustes[codigo] = limpio;
      return { ...prev, ajustes };
    });
    setSucio(true);
  }

  function alternarVisible(f: Fila) {
    if (f.origen === "api") {
      ajustar(f.codigo, { oculto: !f.oculto });
    } else {
      setEditable((prev) => ({
        ...prev,
        manuales: prev.manuales.map((m) =>
          m.id === f.id ? { ...m, activo: f.oculto } : m,
        ),
      }));
      setSucio(true);
    }
    setFilas((prev) =>
      prev.map((x) => (x.id === f.id ? { ...x, oculto: !x.oculto } : x)),
    );
  }

  function cambiarPrecio(f: Fila, valor: string) {
    const n = Number(valor);
    const precio = Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;

    if (f.origen === "api") {
      ajustar(f.codigo, { precio });
    } else {
      setEditable((prev) => ({
        ...prev,
        manuales: prev.manuales.map((m) =>
          m.id === f.id ? { ...m, precio: precio ?? 0 } : m,
        ),
      }));
      setSucio(true);
    }

    setFilas((prev) =>
      prev.map((x) =>
        x.id === f.id
          ? {
              ...x,
              precio: precio ?? x.precioBase,
              precioAjustado: f.origen === "api" ? (precio ?? null) : null,
            }
          : x,
      ),
    );
  }

  function restaurarPrecio(f: Fila) {
    ajustar(f.codigo, { precio: undefined });
    setFilas((prev) =>
      prev.map((x) =>
        x.id === f.id ? { ...x, precio: x.precioBase, precioAjustado: null } : x,
      ),
    );
  }

  /* ---------------- articulos propios ---------------- */

  function nuevoArticulo() {
    setEditando(articuloVacio(categorias[0]?.nombre ?? "OFICINA"));
    setEsNuevo(true);
  }

  function editarArticulo(f: Fila) {
    const m = editable.manuales.find((x) => x.id === f.id);
    if (!m) return;
    setEditando({ ...m, colores: m.colores.map((c) => ({ ...c })) });
    setEsNuevo(false);
  }

  function guardarArticulo(draft: ArticuloManual) {
    if (!draft.nombre.trim()) return notificar(false, "El nombre es obligatorio");
    if (!(draft.precio > 0)) return notificar(false, "El precio debe ser mayor a 0");
    if (!draft.categoria.trim()) return notificar(false, "Elige una categoría");

    setEditable((prev) => {
      if (esNuevo) {
        const usados = new Set([
          ...prev.manuales.map((m) => m.id),
          ...filas.map((f) => f.id),
        ]);
        let id = slug(draft.nombre) || `articulo-${Date.now()}`;
        let n = 2;
        while (usados.has(id)) id = `${slug(draft.nombre)}-${n++}`;
        const codigo = draft.codigo.trim() || `PZ-${id.slice(0, 10).toUpperCase()}`;
        return { ...prev, manuales: [{ ...draft, id, codigo }, ...prev.manuales] };
      }
      return {
        ...prev,
        manuales: prev.manuales.map((m) => (m.id === draft.id ? draft : m)),
      };
    });
    // la tabla se actualiza en el momento, sin releer del servidor
    setFilas((prev) => {
      const fila = (m: ArticuloManual): Fila => ({
        ...m,
        categoriaSlug: slug(m.categoria),
        origen: "propio",
        oculto: !m.activo,
        precioBase: m.precio,
        precioAjustado: null,
      });
      if (esNuevo) {
        const usados = new Set([...editable.manuales.map((m) => m.id), ...prev.map((f) => f.id)]);
        let id = slug(draft.nombre) || `articulo-${Date.now()}`;
        let n = 2;
        while (usados.has(id)) id = `${slug(draft.nombre)}-${n++}`;
        const codigo = draft.codigo.trim() || `PZ-${id.slice(0, 10).toUpperCase()}`;
        return [fila({ ...draft, id, codigo }), ...prev];
      }
      return prev.map((f) => (f.id === draft.id ? fila(draft) : f));
    });

    setSucio(true);
    setEditando(null);
    notificar(true, "Guardado. Publica los cambios para que se vean en el sitio.");
  }

  function borrarArticulo(f: Fila) {
    if (!confirm(`¿Eliminar "${f.nombre}"? Esta acción no se puede deshacer.`)) return;
    setEditable((prev) => ({
      ...prev,
      manuales: prev.manuales.filter((m) => m.id !== f.id),
    }));
    setFilas((prev) => prev.filter((x) => x.id !== f.id));
    setSucio(true);
  }

  /* ---------------- filtros ---------------- */

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return filas.filter((f) => {
      if (filtroCat && f.categoriaSlug !== filtroCat) return false;
      if (filtroOrigen && f.origen !== filtroOrigen) return false;
      if (filtroEstado === "visible" && f.oculto) return false;
      if (filtroEstado === "oculto" && !f.oculto) return false;
      if (filtroEstado === "ajustado" && f.precioAjustado == null) return false;
      if (!q) return true;
      return (
        f.nombre.toLowerCase().includes(q) ||
        f.codigo.toLowerCase().includes(q) ||
        f.subcategoria.toLowerCase().includes(q)
      );
    });
  }, [filas, busqueda, filtroCat, filtroOrigen, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const actual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA);

  const stats = useMemo(
    () => ({
      total: filas.length,
      api: filas.filter((f) => f.origen === "api").length,
      propios: filas.filter((f) => f.origen === "propio").length,
      ocultos: filas.filter((f) => f.oculto).length,
      ajustados: filas.filter((f) => f.precioAjustado != null).length,
    }),
    [filas],
  );

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center text-navy-400">
        Cargando catálogo… (son más de 1,800 artículos, tarda unos segundos)
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900">
            Catálogo
          </h1>
          <p className="text-sm text-navy-500">
            Artículos del proveedor y propios, en un solo listado
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={nuevoArticulo}
            className="rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:border-brand-400"
          >
            + Artículo propio
          </button>
          <button
            onClick={guardar}
            disabled={guardando || !sucio}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {guardando ? "Publicando…" : sucio ? "Publicar cambios" : "Sin cambios"}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total" value={stats.total.toLocaleString("es-MX")} />
        <Stat label="Del proveedor" value={stats.api.toLocaleString("es-MX")} />
        <Stat label="Propios" value={stats.propios} tono="ok" />
        <Stat label="Ocultos" value={stats.ocultos} tono="warn" />
        <Stat label="Precio ajustado" value={stats.ajustados} tono="ok" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por nombre, código o línea…"
          className="min-w-[220px] flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300"
        />
        <select
          value={filtroCat}
          onChange={(e) => {
            setFiltroCat(e.target.value);
            setPagina(1);
          }}
          className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          value={filtroOrigen}
          onChange={(e) => {
            setFiltroOrigen(e.target.value as typeof filtroOrigen);
            setPagina(1);
          }}
          className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700"
        >
          <option value="">Todo origen</option>
          <option value="api">Del proveedor</option>
          <option value="propio">Propios</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value as typeof filtroEstado);
            setPagina(1);
          }}
          className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700"
        >
          <option value="">Todo estado</option>
          <option value="visible">Visibles</option>
          <option value="oculto">Ocultos</option>
          <option value="ajustado">Con precio ajustado</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        {visibles.length === 0 ? (
          <p className="p-10 text-center text-navy-400">
            No hay artículos que coincidan con el filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-navy-100 bg-navy-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Artículo</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Categoría</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-600">Origen</th>
                  <th className="px-4 py-3 text-right font-semibold text-navy-600">Precio público</th>
                  <th className="px-4 py-3 text-center font-semibold text-navy-600">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold text-navy-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((f) => (
                  <tr
                    key={f.id}
                    className={`border-b border-navy-50 transition hover:bg-navy-50/60 ${
                      f.oculto ? "opacity-55" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-navy-50">
                          {f.imagen && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.imagen}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-navy-800">{f.nombre}</p>
                          <p className="font-mono text-xs text-navy-400">
                            {f.codigo}
                            {f.subcategoria ? ` · ${f.subcategoria}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{f.categoria}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          f.origen === "api"
                            ? "bg-navy-100 text-navy-600"
                            : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {f.origen === "api" ? "Proveedor" : "Propio"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-navy-400">$</span>
                        <input
                          type="number"
                          min={0}
                          defaultValue={f.precio}
                          key={`${f.id}-${f.precio}`}
                          onBlur={(e) => {
                            if (Number(e.target.value) !== f.precio) {
                              cambiarPrecio(f, e.target.value);
                            }
                          }}
                          className={`w-24 rounded-lg border px-2 py-1 text-right font-medium ${
                            f.precioAjustado != null
                              ? "border-brand-400 bg-brand-50 text-brand-800"
                              : "border-navy-200 text-navy-800"
                          }`}
                        />
                        {f.precioAjustado != null && (
                          <button
                            onClick={() => restaurarPrecio(f)}
                            title={`Volver al precio calculado ($${f.precioBase})`}
                            className="text-xs text-navy-400 transition hover:text-brand-600"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                      {f.precioAjustado != null && (
                        <p className="mt-0.5 text-right text-[0.65rem] text-navy-400">
                          calculado: ${f.precioBase}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => alternarVisible(f)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          f.oculto
                            ? "bg-navy-100 text-navy-500 hover:bg-navy-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                      >
                        {f.oculto ? "Oculto" : "Visible"}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      {f.origen === "propio" ? (
                        <>
                          <button
                            onClick={() => editarArticulo(f)}
                            className="text-xs font-medium text-navy-700 hover:underline"
                          >
                            Editar
                          </button>
                          <span className="mx-2 text-navy-200">|</span>
                          <button
                            onClick={() => borrarArticulo(f)}
                            className="text-xs font-medium text-brand-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <a
                          href={`/catalogo/${f.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-navy-500 hover:underline"
                        >
                          Ver ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-navy-400">
          {filtradas.length.toLocaleString("es-MX")} artículos · página {actual} de{" "}
          {totalPaginas}
        </p>
        {totalPaginas > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPagina(actual - 1)}
              disabled={actual <= 1}
              className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-700 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPagina(actual + 1)}
              disabled={actual >= totalPaginas}
              className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-700 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {sucio && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-navy-900 px-5 py-2.5 text-sm text-white shadow-xl">
          Tienes cambios sin publicar
        </div>
      )}

      {editando && (
        <ModalArticulo
          draft={editando}
          esNuevo={esNuevo}
          categorias={categorias}
          onChange={setEditando}
          onClose={() => setEditando(null)}
          onSubmit={guardarArticulo}
          onError={(m) => notificar(false, m)}
        />
      )}

      {aviso && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-xl ${
            aviso.ok ? "bg-emerald-600" : "bg-brand-600"
          }`}
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tono,
}: {
  label: string;
  value: number | string;
  tono?: "ok" | "warn";
}) {
  const color =
    tono === "ok" ? "text-emerald-600" : tono === "warn" ? "text-amber-600" : "text-navy-800";
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-navy-400">{label}</p>
      <p className={`font-display text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function ModalArticulo({
  draft,
  esNuevo,
  categorias,
  onChange,
  onClose,
  onSubmit,
  onError,
}: {
  draft: ArticuloManual;
  esNuevo: boolean;
  categorias: Categoria[];
  onChange: (a: ArticuloManual) => void;
  onClose: () => void;
  onSubmit: (a: ArticuloManual) => void;
  onError: (m: string) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ArticuloManual>(k: K, v: ArticuloManual[K]) =>
    onChange({ ...draft, [k]: v });

  async function subir(file: File) {
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug(draft.nombre || "articulo"));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen");
      onChange({
        ...draft,
        imagen: data.url,
        imagenes: [data.url, ...draft.imagenes.filter((i) => i !== data.url)],
      });
    } catch (e) {
      onError(e instanceof Error ? e.message : "No se pudo subir la imagen");
    }
    setSubiendo(false);
  }

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
            {esNuevo ? "Nuevo artículo propio" : `Editar: ${draft.nombre}`}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-navy-400 transition hover:bg-navy-50"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <span className={etiqueta}>Imagen *</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-navy-200 bg-navy-50">
                {draft.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.imagen} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-navy-300">Sin imagen</span>
                )}
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subir(f);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={subiendo}
                  className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
                >
                  {subiendo ? "Subiendo…" : draft.imagen ? "Cambiar imagen" : "Subir imagen"}
                </button>
                <p className="mt-1 text-xs text-navy-400">JPG, PNG, WebP o AVIF. Máx 5 MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className={etiqueta} htmlFor="a-nombre">Nombre *</label>
            <input
              id="a-nombre"
              value={draft.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              className={campo}
            />
          </div>
          <div>
            <label className={etiqueta} htmlFor="a-codigo">Código / SKU</label>
            <input
              id="a-codigo"
              value={draft.codigo}
              onChange={(e) => set("codigo", e.target.value.toUpperCase())}
              placeholder="Se genera solo si lo dejas vacío"
              className={`${campo} font-mono`}
            />
          </div>

          <div>
            <label className={etiqueta} htmlFor="a-cat">Categoría *</label>
            <select
              id="a-cat"
              value={draft.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              className={campo}
            >
              {categorias.map((c) => (
                <option key={c.slug} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-navy-400">
              Son las mismas del buscador, para que quede mezclado con el resto.
            </p>
          </div>
          <div>
            <label className={etiqueta} htmlFor="a-sub">Línea</label>
            <input
              id="a-sub"
              value={draft.subcategoria}
              onChange={(e) => set("subcategoria", e.target.value)}
              placeholder="TERMOS, LIBRETAS…"
              className={campo}
            />
          </div>

          <div>
            <label className={etiqueta} htmlFor="a-precio">Precio público (MXN) *</label>
            <input
              id="a-precio"
              type="number"
              min={0}
              value={draft.precio || ""}
              onChange={(e) => set("precio", Number(e.target.value))}
              className={campo}
            />
            <p className="mt-1 text-xs text-navy-400">
              Es el precio final que ve el cliente. No se le aplica margen.
            </p>
          </div>
          <div>
            <label className={etiqueta} htmlFor="a-inv">Inventario</label>
            <input
              id="a-inv"
              type="number"
              min={0}
              value={draft.inventario || ""}
              onChange={(e) => set("inventario", Number(e.target.value))}
              placeholder="0 = sobre pedido"
              className={campo}
            />
          </div>

          <div>
            <label className={etiqueta} htmlFor="a-mat">Material</label>
            <input
              id="a-mat"
              value={draft.composicion}
              onChange={(e) => set("composicion", e.target.value)}
              className={campo}
            />
          </div>
          <div>
            <label className={etiqueta} htmlFor="a-cap">Capacidad / medida</label>
            <input
              id="a-cap"
              value={draft.capacidad ?? ""}
              onChange={(e) => set("capacidad", e.target.value || null)}
              className={campo}
            />
          </div>

          <div>
            <label className={etiqueta} htmlFor="a-area">Área de impresión</label>
            <input
              id="a-area"
              value={draft.areaImpresion ?? ""}
              onChange={(e) => set("areaImpresion", e.target.value || null)}
              placeholder="8 x 5 cm"
              className={campo}
            />
          </div>
          <div>
            <label className={etiqueta} htmlFor="a-tec">Técnicas de impresión</label>
            <input
              id="a-tec"
              value={draft.metodosImpresion.join(", ")}
              onChange={(e) =>
                set(
                  "metodosImpresion",
                  e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                )
              }
              placeholder="Serigrafía, Grabado Láser"
              className={campo}
            />
          </div>

          <div className="md:col-span-2">
            <label className={etiqueta} htmlFor="a-desc">Descripción</label>
            <textarea
              id="a-desc"
              rows={3}
              value={draft.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              className={campo}
            />
          </div>

          <div className="md:col-span-2">
            <span className={etiqueta}>Colores</span>
            <div className="space-y-2">
              {draft.colores.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={c.color}
                    onChange={(e) => {
                      const colores = [...draft.colores];
                      colores[i] = { ...colores[i], color: e.target.value };
                      set("colores", colores);
                    }}
                    placeholder="Nombre del color"
                    className={campo}
                  />
                  <button
                    type="button"
                    onClick={() => set("colores", draft.colores.filter((_, j) => j !== i))}
                    className="rounded-lg px-2 py-1 text-brand-600 transition hover:bg-brand-50"
                    aria-label="Quitar color"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                set("colores", [...draft.colores, { color: "", inventario: 0, imagen: null }])
              }
              className="mt-2 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 transition hover:bg-navy-50"
            >
              + Agregar color
            </button>
          </div>

          <div className="flex flex-wrap gap-5 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={draft.activo}
                onChange={(e) => set("activo", e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              Visible en el sitio
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={draft.nuevo}
                onChange={(e) => set("nuevo", e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              Marcar como nuevo
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={draft.promocion}
                onChange={(e) => set("promocion", e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              Marcar en promoción
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
            disabled={subiendo}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {esNuevo ? "Agregar al catálogo" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
