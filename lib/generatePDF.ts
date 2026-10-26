import { jsPDF } from "jspdf";

interface QuoteData {
  clientName: string;
  clientPhone: string;
  clientCompany: string;
  productName: string;
  productColor: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  date: string;
  /** Producto con el logo del cliente encima, ya compuesto. Opcional. */
  vistaPrevia?: string | null;
}

export function generateQuotePDF(data: QuoteData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(16, 42, 74);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PROMO", 20, 25);
  const promoW = doc.getTextWidth("PROMO");
  doc.setTextColor(255, 90, 98);
  doc.text("ZONE", 20 + promoW, 25);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Cotización de Productos Promocionales", 20, 37);

  // Quote info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Fecha: ${data.date}`, pageWidth - 70, 55);
  doc.text(`Cotización #${Math.floor(Math.random() * 9000) + 1000}`, pageWidth - 70, 62);

  // Client info
  doc.setTextColor(16, 42, 74);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Datos del Cliente", 20, 75);

  doc.setDrawColor(16, 42, 74);
  doc.line(20, 78, pageWidth - 20, 78);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${data.clientName}`, 20, 88);
  doc.text(`Teléfono: ${data.clientPhone}`, 20, 96);
  if (data.clientCompany) {
    doc.text(`Empresa: ${data.clientCompany}`, 20, 104);
  }

  // Product details
  const productY = data.clientCompany ? 120 : 112;
  doc.setTextColor(16, 42, 74);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Cotización", 20, productY);
  doc.line(20, productY + 3, pageWidth - 20, productY + 3);

  // Table header
  const tableY = productY + 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, tableY - 5, pageWidth - 40, 12, "F");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Producto", 25, tableY + 2);
  doc.text("Color", 95, tableY + 2);
  doc.text("Cant.", 130, tableY + 2);
  doc.text("P. Unit.", 150, tableY + 2);
  doc.text("Subtotal", 175, tableY + 2);

  // Table row
  const rowY = tableY + 15;
  doc.setFont("helvetica", "normal");
  doc.text(data.productName, 25, rowY);
  doc.text(data.productColor, 95, rowY);
  doc.text(String(data.quantity), 130, rowY);
  doc.text(`$${data.unitPrice.toFixed(2)}`, 150, rowY);
  doc.text(`$${(data.unitPrice * data.quantity).toFixed(2)}`, 175, rowY);

  // Totals
  const totalsY = rowY + 20;
  doc.line(140, totalsY - 5, pageWidth - 20, totalsY - 5);

  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 140, totalsY + 2);
  doc.text(`$${(data.unitPrice * data.quantity).toFixed(2)}`, 175, totalsY + 2);

  if (data.discount > 0) {
    doc.setTextColor(200, 27, 34);
    doc.text(`Descuento (${data.discount}%):`, 140, totalsY + 12);
    doc.text(`-$${((data.unitPrice * data.quantity * data.discount) / 100).toFixed(2)}`, 175, totalsY + 12);
  }

  doc.setTextColor(16, 42, 74);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const totalLineY = data.discount > 0 ? totalsY + 25 : totalsY + 15;
  doc.line(140, totalLineY - 5, pageWidth - 20, totalLineY - 5);
  doc.text("TOTAL:", 140, totalLineY + 2);
  doc.text(`$${data.total.toFixed(2)} MXN`, 175, totalLineY + 2);

  // Vista previa con el logo del cliente, si la armo en la pagina
  if (data.vistaPrevia) {
    const previaY = totalLineY + 12;
    doc.setTextColor(16, 42, 74);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Vista previa con tu logo", 20, previaY);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Imagen de referencia, no es una prueba de impresión.", 20, previaY + 5);
    try {
      doc.addImage(data.vistaPrevia, "JPEG", 20, previaY + 9, 46, 46);
    } catch {
      // si la imagen no se pudo insertar, la cotizacion sale igual
    }
  }

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const footerY = 270;
  // Mismo texto que la pagina del producto: ahi se dice que el precio NO
  // incluye personalizacion, y el PDF afirmaba lo contrario.
  doc.text("Precio de referencia sin IVA ni personalización.", 20, footerY);
  doc.text("Te confirmamos el precio final por WhatsApp.", 20, footerY + 7);
  doc.text("PromoZone - Más que promocionales | promozone.com.mx | WhatsApp: 55 5074 6699", 20, footerY + 14);

  return doc;
}
