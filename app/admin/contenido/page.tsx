"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONTENIDO_VACIO,
  nuevoId,
  type CasoExito,
  type Contenido,
  type Promocion,
  type Testimonio,
} from "@/lib/contenido";

type Pestana = "promociones" | "testimonios" | "casos";

const campo =
  "w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
const etiqueta =
  "block text-xs font-semibold uppercase tracking-wide text-navy-500 mb-1";

export default function ContenidoAdminPage() {
  const [c, setC] = useState<Contenido>(CONTENIDO_VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pestana, setPestana] = useState<Pestana>("promociones");

  useEffect(() => {
    fetch("/api/contenido")
      .then((r) => r.json())
      .then((d: Contenido) => setC(d))
      .catch(() => notificar(false, "No se pudo cargar el contenido"))
      .finally(() => setCargando(false));
  }, []);

  function notificar(ok: boolean, texto: string) {
    setAviso({ ok, texto });
    setTimeout(() => setAviso(null), 3500);
  }

  async function guardar() {
    setGuardando(true);
    try {
      const res = await fetch("/api/contenido", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: c }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al guardar");
      }
      notificar(true, "Cambios publicados en el sitio");
    } catch (e) {
      notificar(false, e instanceof Error ? e.message : "Error al guardar");
    }
    setGuardando(false);
  }

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center text-navy-400">
        Cargando contenido…
      </div>
    );
  }

  const pestanas: { id: Pestana; label: string; n: number }[] = [
    { id: "promociones", label: "Promociones", n: c.promociones.length },
    { id: "testimonios", label: "Reseñas", n: c.testimonios.length },
    { id: "casos", label: "Casos de éxito", n: c.casos.length },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900">
            Contenido del sitio
          </h1>
          <p className="text-sm text-navy-500">
            Promociones, reseñas y casos de éxito que se muestran en el home y
            el menú
          </p>
        </div>
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {guardando ? "Publicando…" : "Publicar cambios"}
        </button>
      </div>

      {/* ventana emergente */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-navy-800">
              Ventana emergente de escritorio
            </h2>
            <p className="text-xs text-navy-400">
              Aparece una vez por sesión, solo si hay promociones activas. En
              móvil se muestra el banner del menú en su lugar.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={c.modal.activo}
              onChange={(e) =>
                setC({ ...c, modal: { ...c.modal, activo: e.target.checked } })
              }
              className="h-4 w-4 accent-brand-600"
            />
            Activa
          </label>
        </div>

        {c.modal.activo && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <span className={etiqueta}>Título</span>
              <input
                value={c.modal.titulo}
                onChange={(e) =>
                  setC({ ...c, modal: { ...c.modal, titulo: e.target.value } })
                }
                className={campo}
              />
            </div>
            <div>
              <span className={etiqueta}>Texto de apoyo</span>
              <input
                value={c.modal.texto}
                onChange={(e) =>
                  setC({ ...c, modal: { ...c.modal, texto: e.target.value } })
                }
                className={campo}
              />
            </div>
          </div>
        )}
      </div>

      {/* boton flotante */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-navy-800">
              Botón flotante de WhatsApp
            </h2>
            <p className="text-xs text-navy-400">
              Aparece al desplazarse y abre una burbuja una vez por sesión. El
              mensaje de WhatsApp incluye la página que el visitante está
              viendo.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={c.flotante.activo}
              onChange={(e) =>
                setC({ ...c, flotante: { ...c.flotante, activo: e.target.checked } })
              }
              className="h-4 w-4 accent-brand-600"
            />
            Activo
          </label>
        </div>

        {c.flotante.activo && (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <span className={etiqueta}>Título</span>
                <input
                  value={c.flotante.titulo}
                  onChange={(e) =>
                    setC({ ...c, flotante: { ...c.flotante, titulo: e.target.value } })
                  }
                  className={campo}
                />
              </div>
              <div className="md:col-span-2">
                <span className={etiqueta}>Texto</span>
                <input
                  value={c.flotante.texto}
                  onChange={(e) =>
                    setC({ ...c, flotante: { ...c.flotante, texto: e.target.value } })
                  }
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Texto del botón</span>
                <input
                  value={c.flotante.cta}
                  onChange={(e) =>
                    setC({ ...c, flotante: { ...c.flotante, cta: e.target.value } })
                  }
                  className={campo}
                />
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-navy-50 p-3 text-xs text-navy-500">
              Si pones un plazo (&ldquo;entregamos en 5 días hábiles&rdquo;), que sea el
              real. Prometer tiempos que no se cumplen cuesta más caro que la
              venta que gana.
            </p>
          </>
        )}
      </div>

      {/* pestañas */}
      <div className="mb-4 flex flex-wrap gap-2">
        {pestanas.map((p) => (
          <button
            key={p.id}
            onClick={() => setPestana(p.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              pestana === p.id
                ? "bg-navy-800 text-white"
                : "border border-navy-200 bg-white text-navy-700 hover:border-brand-400"
            }`}
          >
            {p.label} ({p.n})
          </button>
        ))}
      </div>

      {pestana === "promociones" && (
        <Promociones
          items={c.promociones}
          onChange={(promociones) => setC({ ...c, promociones })}
          onError={(m) => notificar(false, m)}
        />
      )}
      {pestana === "testimonios" && (
        <Testimonios
          items={c.testimonios}
          onChange={(testimonios) => setC({ ...c, testimonios })}
        />
      )}
      {pestana === "casos" && (
        <Casos
          items={c.casos}
          onChange={(casos) => setC({ ...c, casos })}
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

/* ------------------------------- subida ---------------------------------- */

function SubirImagen({
  valor,
  onChange,
  onError,
}: {
  valor: string;
  onChange: (url: string) => void;
  onError: (m: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  async function subir(file: File) {
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", "contenido");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen");
      onChange(data.url);
    } catch (e) {
      onError(e instanceof Error ? e.message : "No se pudo subir la imagen");
    }
    setSubiendo(false);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-navy-200 bg-navy-50">
        {valor ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={valor} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[0.65rem] text-navy-300">Sin imagen</span>
        )}
      </div>
      <div className="flex-1">
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) subir(f);
          }}
        />
        <button
          onClick={() => ref.current?.click()}
          disabled={subiendo}
          className="rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {subiendo ? "Subiendo…" : valor ? "Cambiar" : "Subir imagen"}
        </button>
        {valor && (
          <button
            onClick={() => onChange("")}
            className="ml-2 text-xs text-brand-600 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}

function Tarjeta({
  activo,
  onToggle,
  onDelete,
  titulo,
  children,
}: {
  activo: boolean;
  onToggle: () => void;
  onDelete: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-5 shadow-sm ${activo ? "" : "opacity-60"}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-navy-50 pb-3">
        <p className="truncate font-display font-bold text-navy-800">
          {titulo || "Sin título"}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={onToggle}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activo
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-navy-100 text-navy-500 hover:bg-navy-200"
            }`}
          >
            {activo ? "Publicado" : "Oculto"}
          </button>
          <button
            onClick={onDelete}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ----------------------------- promociones ------------------------------- */

function Promociones({
  items,
  onChange,
  onError,
}: {
  items: Promocion[];
  onChange: (p: Promocion[]) => void;
  onError: (m: string) => void;
}) {
  const set = (i: number, patch: Partial<Promocion>) =>
    onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-4">
      <button
        onClick={() =>
          onChange([
            {
              id: nuevoId("promo"),
              activa: true,
              etiqueta: "Promoción del mes",
              titulo: "",
              texto: "",
              vigencia: "",
              cta: "Ver promoción",
              enlace: "/catalogo",
              imagen: "",
            },
            ...items,
          ])
        }
        className="rounded-lg border border-dashed border-navy-300 px-4 py-2.5 text-sm font-medium text-navy-600 transition hover:border-brand-400 hover:text-brand-700"
      >
        + Agregar promoción
      </button>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-navy-400 shadow-sm">
          Sin promociones. La primera activa es la que aparece en el mega menú,
          en el banner del menú móvil y en la ventana emergente.
        </p>
      ) : (
        items.map((p, i) => (
          <Tarjeta
            key={p.id}
            titulo={p.titulo}
            activo={p.activa}
            onToggle={() => set(i, { activa: !p.activa })}
            onDelete={() => onChange(items.filter((_, j) => j !== i))}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <span className={etiqueta}>Imagen de fondo</span>
                <SubirImagen
                  valor={p.imagen}
                  onChange={(url) => set(i, { imagen: url })}
                  onError={onError}
                />
              </div>
              <div>
                <span className={etiqueta}>Etiqueta</span>
                <input
                  value={p.etiqueta}
                  onChange={(e) => set(i, { etiqueta: e.target.value })}
                  placeholder="Promoción del mes"
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Vigencia</span>
                <input
                  value={p.vigencia}
                  onChange={(e) => set(i, { vigencia: e.target.value })}
                  placeholder="Hasta el 30 de noviembre"
                  className={campo}
                />
              </div>
              <div className="md:col-span-2">
                <span className={etiqueta}>Título</span>
                <input
                  value={p.titulo}
                  onChange={(e) => set(i, { titulo: e.target.value })}
                  placeholder="20% en termos de acero"
                  className={campo}
                />
              </div>
              <div className="md:col-span-2">
                <span className={etiqueta}>Texto</span>
                <textarea
                  value={p.texto}
                  onChange={(e) => set(i, { texto: e.target.value })}
                  rows={2}
                  placeholder="En pedidos de 50 piezas o más, con impresión incluida."
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Texto del botón</span>
                <input
                  value={p.cta}
                  onChange={(e) => set(i, { cta: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Enlace</span>
                <input
                  value={p.enlace}
                  onChange={(e) => set(i, { enlace: e.target.value })}
                  placeholder="/categoria/termos"
                  className={campo}
                />
              </div>
            </div>
          </Tarjeta>
        ))
      )}
    </div>
  );
}

/* ----------------------------- testimonios ------------------------------- */

function Testimonios({
  items,
  onChange,
}: {
  items: Testimonio[];
  onChange: (t: Testimonio[]) => void;
}) {
  const set = (i: number, patch: Partial<Testimonio>) =>
    onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Publica solo reseñas que te hayan dado de verdad, con el nombre y la
        empresa de quien las dijo. Inventarlas o firmarlas con empresas que no
        son clientes es publicidad engañosa.
      </div>

      <button
        onClick={() =>
          onChange([
            {
              id: nuevoId("tes"),
              activo: true,
              nombre: "",
              puesto: "",
              empresa: "",
              texto: "",
              calificacion: 5,
            },
            ...items,
          ])
        }
        className="rounded-lg border border-dashed border-navy-300 px-4 py-2.5 text-sm font-medium text-navy-600 transition hover:border-brand-400 hover:text-brand-700"
      >
        + Agregar reseña
      </button>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-navy-400 shadow-sm">
          Sin reseñas. Mientras no haya ninguna publicada, la sección no
          aparece en el sitio.
        </p>
      ) : (
        items.map((t, i) => (
          <Tarjeta
            key={t.id}
            titulo={t.nombre}
            activo={t.activo}
            onToggle={() => set(i, { activo: !t.activo })}
            onDelete={() => onChange(items.filter((_, j) => j !== i))}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <span className={etiqueta}>Nombre</span>
                <input
                  value={t.nombre}
                  onChange={(e) => set(i, { nombre: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Puesto</span>
                <input
                  value={t.puesto}
                  onChange={(e) => set(i, { puesto: e.target.value })}
                  placeholder="Gerente de Marketing"
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Empresa</span>
                <input
                  value={t.empresa}
                  onChange={(e) => set(i, { empresa: e.target.value })}
                  className={campo}
                />
              </div>
              <div className="md:col-span-3">
                <span className={etiqueta}>Reseña</span>
                <textarea
                  value={t.texto}
                  onChange={(e) => set(i, { texto: e.target.value })}
                  rows={3}
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Calificación</span>
                <select
                  value={t.calificacion}
                  onChange={(e) => set(i, { calificacion: Number(e.target.value) })}
                  className={campo}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)} ({n})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Tarjeta>
        ))
      )}
    </div>
  );
}

/* -------------------------------- casos ---------------------------------- */

function Casos({
  items,
  onChange,
  onError,
}: {
  items: CasoExito[];
  onChange: (k: CasoExito[]) => void;
  onError: (m: string) => void;
}) {
  const set = (i: number, patch: Partial<CasoExito>) =>
    onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Usa trabajos que sí hiciste. Si el cliente no quiere que lo nombres,
        deja el campo vacío y describe el caso sin identificarlo.
      </div>

      <button
        onClick={() =>
          onChange([
            {
              id: nuevoId("caso"),
              activo: true,
              titulo: "",
              cliente: "",
              reto: "",
              solucion: "",
              resultado: "",
              imagen: "",
            },
            ...items,
          ])
        }
        className="rounded-lg border border-dashed border-navy-300 px-4 py-2.5 text-sm font-medium text-navy-600 transition hover:border-brand-400 hover:text-brand-700"
      >
        + Agregar caso
      </button>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-navy-400 shadow-sm">
          Sin casos. Mientras no haya ninguno publicado, ni la sección ni el
          enlace del menú aparecen en el sitio.
        </p>
      ) : (
        items.map((k, i) => (
          <Tarjeta
            key={k.id}
            titulo={k.titulo}
            activo={k.activo}
            onToggle={() => set(i, { activo: !k.activo })}
            onDelete={() => onChange(items.filter((_, j) => j !== i))}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <span className={etiqueta}>Imagen</span>
                <SubirImagen
                  valor={k.imagen}
                  onChange={(url) => set(i, { imagen: url })}
                  onError={onError}
                />
              </div>
              <div>
                <span className={etiqueta}>Título</span>
                <input
                  value={k.titulo}
                  onChange={(e) => set(i, { titulo: e.target.value })}
                  placeholder="500 kits de bienvenida en 3 semanas"
                  className={campo}
                />
              </div>
              <div>
                <span className={etiqueta}>Cliente (opcional)</span>
                <input
                  value={k.cliente}
                  onChange={(e) => set(i, { cliente: e.target.value })}
                  className={campo}
                />
              </div>
              <div className="md:col-span-2">
                <span className={etiqueta}>El reto</span>
                <textarea
                  value={k.reto}
                  onChange={(e) => set(i, { reto: e.target.value })}
                  rows={2}
                  className={campo}
                />
              </div>
              <div className="md:col-span-2">
                <span className={etiqueta}>Lo que hicimos</span>
                <textarea
                  value={k.solucion}
                  onChange={(e) => set(i, { solucion: e.target.value })}
                  rows={2}
                  className={campo}
                />
              </div>
              <div className="md:col-span-2">
                <span className={etiqueta}>Resultado</span>
                <textarea
                  value={k.resultado}
                  onChange={(e) => set(i, { resultado: e.target.value })}
                  rows={2}
                  className={campo}
                />
              </div>
            </div>
          </Tarjeta>
        ))
      )}
    </div>
  );
}
