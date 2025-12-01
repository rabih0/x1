import { PDFDocument, rgb } from "pdf-lib";
import { Invoice, CompanyInfo, Client } from "./db";

export async function buildInvoicePdf(invoice: Invoice) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const margin = 40;
  let y = 780;

  const company = invoice.company_snapshot;
  const client = invoice.client_snapshot;

  page.drawText(company.name || "Meine Firma", {
    x: margin,
    y,
    size: 24,
    color: rgb(0.4, 0.4, 0.8)
  });

  if (company.address) {
    y -= 20;
    page.drawText(company.address, { x: margin, y, size: 9 });
  }

  if (company.phone) {
    y -= 15;
    page.drawText(`Tel: ${company.phone}`, { x: margin, y, size: 9 });
  }

  if (company.email) {
    y -= 15;
    page.drawText(`E-Mail: ${company.email}`, { x: margin, y, size: 9 });
  }

  y -= 40;
  page.drawText("RECHNUNG", { x: margin, y, size: 20, color: rgb(0, 0, 0) });

  y -= 35;
  page.drawText("Rechnungsnummer:", { x: margin, y, size: 10, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(invoice.invoice_number, { x: margin + 150, y, size: 10 });

  y -= 20;
  const invoiceDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString("de-DE")
    : new Date().toLocaleDateString("de-DE");
  page.drawText("Datum:", { x: margin, y, size: 10, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(invoiceDate, { x: margin + 150, y, size: 10 });

  y -= 30;
  page.drawText("Rechnungsempfänger:", { x: margin, y, size: 11, color: rgb(0, 0, 0) });

  y -= 15;
  page.drawText(client.name || "Kunde", { x: margin, y, size: 10 });

  if (client.address) {
    y -= 12;
    page.drawText(client.address, { x: margin, y, size: 10 });
  }

  if (client.email) {
    y -= 12;
    page.drawText(client.email, { x: margin, y, size: 10 });
  }

  y -= 35;
  const headerY = y;
  page.drawText("Beschreibung", { x: margin, y, size: 10, color: rgb(1, 1, 1) });
  page.drawText("Menge", { x: 300, y, size: 10, color: rgb(1, 1, 1) });
  page.drawText("Preis", { x: 380, y, size: 10, color: rgb(1, 1, 1) });
  page.drawText("Gesamt", { x: 470, y, size: 10, color: rgb(1, 1, 1) });

  y -= 2;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 555, y },
    color: rgb(0.8, 0.8, 0.8)
  });

  y -= 20;

  invoice.items.forEach((item) => {
    page.drawText(item.title, { x: margin, y, size: 10 });
    page.drawText(item.qty.toString(), { x: 320, y, size: 10 });
    page.drawText(`€${item.price.toFixed(2)}`, { x: 380, y, size: 10 });
    page.drawText(`€${item.total.toFixed(2)}`, { x: 470, y, size: 10 });
    y -= 20;
  });

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 555, y },
    color: rgb(0.8, 0.8, 0.8)
  });

  y -= 25;
  page.drawText("Zwischensumme:", { x: 350, y, size: 11 });
  page.drawText(`€${invoice.subtotal.toFixed(2)}`, { x: 470, y, size: 11 });

  if (invoice.tax && invoice.tax > 0) {
    y -= 18;
    page.drawText("Steuer:", { x: 350, y, size: 11 });
    page.drawText(`€${invoice.tax.toFixed(2)}`, { x: 470, y, size: 11 });
  }

  y -= 18;
  page.drawText("Gesamt:", {
    x: 350,
    y,
    size: 14,
    color: rgb(0.4, 0.4, 0.8)
  });
  page.drawText(`€${invoice.total.toFixed(2)}`, {
    x: 470,
    y,
    size: 14,
    color: rgb(0.4, 0.4, 0.8)
  });

  if (invoice.notes) {
    y -= 50;
    page.drawText("Notizen:", { x: margin, y, size: 11, color: rgb(0.5, 0.5, 0.5) });
    y -= 15;
    const lines = invoice.notes.split("\n");
    lines.forEach((line) => {
      page.drawText(line, { x: margin, y, size: 9 });
      y -= 12;
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return { blob, url };
}
