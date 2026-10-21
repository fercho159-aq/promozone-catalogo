"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: "📋" },
  { href: "/admin/productos", label: "Productos", icon: "📦" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "out" | "in">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => setStatus(d.authenticated ? "in" : "out"))
      .catch(() => setStatus("out"));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setStatus("in");
        setPassword("");
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "No se pudo iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    setStatus("out");
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <p className="text-navy-400">Cargando panel…</p>
      </div>
    );
  }

  if (status === "out") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
        >
          <Logo variant="onLight" size="md" href={null} />
          <h1 className="mt-6 font-display text-2xl font-extrabold text-navy-900">
            Panel de administración
          </h1>
          <p className="mb-6 mt-1 text-sm text-navy-500">
            Ingresa la contraseña para acceder
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-navy-200 px-4 py-3 text-navy-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {error && (
            <p role="alert" className="mt-3 text-sm text-brand-600">
              {error}
            </p>
          )}
          <button
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-navy-800 py-3 font-display font-bold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-navy-400 transition hover:text-brand-600"
          >
            ← Volver al sitio
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <Logo variant="onDark" size="sm" href="/admin" />
            <nav className="flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-brand-600 text-white"
                      : "text-navy-200 hover:bg-white/10"
                  }`}
                >
                  <span aria-hidden="true">{link.icon}</span> {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-navy-300 transition hover:text-white"
            >
              Ver sitio ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-brand-onDark transition hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
