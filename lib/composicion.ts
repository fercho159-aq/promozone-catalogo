/**
 * Arma una sola imagen con el producto y el logo encima, para meterla en el PDF.
 *
 * El dibujo se hace en un canvas, y un canvas se "mancha" (y deja de poder
 * exportarse) si recibe una imagen de otro dominio. Las fotos del proveedor
 * viven en assets.4promotional.net, asi que no se piden directo: se piden al
 * optimizador de imagenes de Next, que las sirve desde nuestro propio dominio.
 */

/** Posicion del centro del logo, en fracciones del ancho/alto (0 a 1) */
export interface PosicionLogo {
  x: number;
  y: number;
  /** Ancho del logo como fraccion del ancho del producto */
  escala: number;
}

const LADO = 900;

/** Misma URL que usa next/image, por eso cuenta como propia del sitio */
export function urlOptimizada(src: string, ancho = 750): string {
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${ancho}&q=75`;
}

function cargar(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No cargo la imagen: ${src}`));
    img.src = src;
  });
}

/** Encaja la imagen dentro del cuadro sin deformarla */
function encajar(img: HTMLImageElement, lado: number) {
  const escala = Math.min(lado / img.naturalWidth, lado / img.naturalHeight);
  const w = img.naturalWidth * escala;
  const h = img.naturalHeight * escala;
  return { w, h, x: (lado - w) / 2, y: (lado - h) / 2 };
}

/**
 * Devuelve la composicion como data URL, o null si algo no se pudo dibujar.
 * Nunca lanza: el PDF debe poder generarse aunque la vista previa falle.
 */
export async function componerConLogo(
  productoSrc: string,
  logoSrc: string,
  pos: PosicionLogo,
): Promise<string | null> {
  try {
    const [producto, logo] = await Promise.all([
      cargar(urlOptimizada(productoSrc)),
      cargar(logoSrc),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width = LADO;
    canvas.height = LADO;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LADO, LADO);

    const caja = encajar(producto, LADO);
    ctx.drawImage(producto, caja.x, caja.y, caja.w, caja.h);

    // el logo se mide contra el producto, no contra el lienzo, para que se vea
    // igual que en pantalla aunque la foto no llene el cuadro
    const anchoLogo = caja.w * pos.escala;
    const altoLogo = anchoLogo * (logo.naturalHeight / logo.naturalWidth || 1);
    ctx.drawImage(
      logo,
      caja.x + caja.w * pos.x - anchoLogo / 2,
      caja.y + caja.h * pos.y - altoLogo / 2,
      anchoLogo,
      altoLogo,
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return null;
  }
}
