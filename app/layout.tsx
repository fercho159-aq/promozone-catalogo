import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Artículos Promocionales Personalizados en México`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "artículos promocionales",
    "productos promocionales",
    "promocionales personalizados",
    "artículos publicitarios",
    "termos personalizados",
    "tazas personalizadas",
    "playeras personalizadas",
    "bolígrafos promocionales",
    "mochilas personalizadas",
    "regalos corporativos",
    "merchandising empresarial",
    "promocionales México",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Artículos Promocionales Personalizados`,
    description: site.description,
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Artículos Promocionales Personalizados`,
    description: site.shortDescription,
    images: ["/brand/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
  formatDetection: {
    telephone: true,
    address: false,
    email: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#102a4a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Datos estructurados globales: identidad del negocio + sitio
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        legalName: site.legalName,
        url: site.url,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}/brand/icon.png`,
          width: 512,
          height: 512,
        },
        image: `${site.url}/brand/og-image.jpg`,
        description: site.description,
        slogan: site.tagline,
        areaServed: {
          "@type": "Country",
          name: site.areaServed,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: site.phoneE164,
            contactType: "sales",
            email: site.email,
            areaServed: "MX",
            availableLanguage: ["Spanish"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: site.lang,
      },
    ],
  };

  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-navy-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
