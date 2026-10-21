import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromoShop - Catálogo de Artículos Promocionales",
  description: "Cotiza artículos promocionales personalizados con tu logo. Termos, tazas, playeras, bolígrafos y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xl font-bold">PromoShop</p>
            <p className="text-gray-400 mt-2 text-sm">
              Artículos Promocionales Personalizados
            </p>
            <a
              href="https://wa.me/5215550746699"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full text-sm font-semibold transition"
            >
              Contáctanos por WhatsApp
            </a>
            <p className="text-gray-500 mt-4 text-xs">
              © 2026 PromoShop. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
