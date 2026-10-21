"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          PromoShop
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200 transition">Inicio</Link>
          <Link href="/#categorias" className="hover:text-blue-200 transition">Categorías</Link>
          <a
            href="https://wa.me/5255074669"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-full text-sm font-semibold transition"
          >
            WhatsApp
          </a>
        </nav>
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-blue-700 px-4 py-3 space-y-2">
          <Link href="/" className="block hover:text-blue-200" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/#categorias" className="block hover:text-blue-200" onClick={() => setMenuOpen(false)}>Categorías</Link>
          <a
            href="https://wa.me/5255074669"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-center font-semibold"
          >
            WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
