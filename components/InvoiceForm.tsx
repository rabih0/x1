"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Client, Task, CompanyInfo, Invoice, InvoiceItem, db } from "@/lib/db";
import ClientSelector from "./ClientSelector";
import TaskSelector from "./TaskSelector";
import InvoicePreviewModal from "./InvoicePreviewModal";
import { buildInvoicePdf } from "@/lib/pdf";
import { useInvoiceForm } from "@/lib/store";

interface InvoiceFormProps {
  invoiceId?: number;
}

export default function InvoiceForm({ invoiceId }: InvoiceFormProps) {
  const { t } = useTranslation();
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingQty, setEditingQty] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState<"draft" | "sent" | "paid">("draft");
  const [notes, setNotes] = useState("");
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(true);

  const store = useInvoiceForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companies = await db.company.toArray();
      if (companies.length > 0) {
        setCompany(companies[0]);
      }

      if (invoiceId) {
        const invoice = await db.invoices.get(invoiceId);
        if (invoice) {
          store.setSelectedClient(invoice.client_snapshot);
          invoice.items.forEach((item) => {
            store.addItem(item);
          });
          setNotes(invoice.notes || "");
          setTax(invoice.tax || 0);
          setInvoiceNumber(invoice.invoice_number);
          setStatus(invoice.status);
        }
      } else {
        const invoices = await db.invoices.toArray();
        const nextNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
        setInvoiceNumber(nextNumber);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return store.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (tax || 0);
  };

  const handleEditRow = (index: number) => {
    const item = store.items[index];
    setEditingRowIndex(index);
    setEditingQty(item.qty.toString());
    setEditingPrice(item.price.toFixed(2));
  };

  const handleSaveRow = () => {
    if (editingRowIndex !== null) {
      const qty = parseFloat(editingQty) || 1;
      const price = parseFloat(editingPrice) || 0;
      const item = store.items[editingRowIndex];
      const updatedItem: InvoiceItem = {
        ...item,
        qty,
        price,
        total: qty * price,
      };
      store.updateItem(editingRowIndex, updatedItem);
      setEditingRowIndex(null);
      setEditingQty("");
      setEditingPrice("");
    }
  };

  const handlePreview = async () => {
    if (!store.selectedClient || store.items.length === 0 || !company) {
      alert("Bitte wählen Sie einen Kunden und mindestens eine Position");
      return;
    }

    const invoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      client_id: store.selectedClient.id || 0,
      client_snapshot: store.selectedClient,
      company_snapshot: company,
      items: store.items,
      subtotal: calculateSubtotal(),
      tax,
      total: calculateTotal(),
      notes,
      status,
      createdAt: new Date(),
    };

    try {
      const { url } = await buildInvoicePdf(invoice);
      setPdfUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleSaveInvoice = async () => {
    if (!store.selectedClient || store.items.length === 0 || !company) {
      alert("Bitte wählen Sie einen Kunden und mindestens eine Position");
      return;
    }

    const invoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      client_id: store.selectedClient.id || 0,
      client_snapshot: store.selectedClient,
      company_snapshot: company,
      items: store.items,
      subtotal: calculateSubtotal(),
      tax,
      total: calculateTotal(),
      notes,
      status,
      createdAt: new Date(),
    };

    try {
      if (invoiceId) {
        await db.invoices.update(invoiceId, invoice);
      } else {
        await db.invoices.add(invoice);
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass">
        <h2 className="text-2xl font-bold mb-6">
          {invoiceId ? t("invoice.edit") : t("invoice.create")}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("invoice.number")}
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("invoice.status")}
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "sent" | "paid")
              }
              className="input-field"
            >
              <option value="draft">{t("invoice.draft")}</option>
              <option value="sent">{t("invoice.sent")}</option>
              <option value="paid">{t("invoice.paid")}</option>
            </select>
          </div>
        </div>
      </div>

      <ClientSelector selectedClient={store.selectedClient} />
      <TaskSelector
        selectedIds={store.selectedTasks.map((t) => t.id || 0)}
        onTaskSelect={(task) => {
          const isSelected = store.selectedTasks.some((t) => t.id === task.id);
          if (isSelected) {
            store.removeSelectedTask(task.id || 0);
          } else {
            store.addSelectedTask(task);
          }
        }}
      />

      <div className="glass">
        <h3 className="text-xl font-bold mb-4">{t("invoice.items")}</h3>

        {store.items.length === 0 ? (
          <p className="text-gray-500 mb-4">{t("invoice.no_items")}</p>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-3">{t("invoice.description")}</th>
                  <th className="text-center py-3 px-3">{t("invoice.quantity")}</th>
                  <th className="text-right py-3 px-3">{t("invoice.price")}</th>
                  <th className="text-right py-3 px-3">{t("invoice.total")}</th>
                  <th className="text-center py-3 px-3">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {store.items.map((item, index) => (
                  <tr key={index} className="table-row">
                    <td className="py-3 px-3">{item.title}</td>
                    <td className="py-3 px-3 text-center">
                      {editingRowIndex === index ? (
                        <input
                          type="number"
                          value={editingQty}
                          onChange={(e) => setEditingQty(e.target.value)}
                          className="input-field w-20 text-center"
                          min="1"
                        />
                      ) : (
                        item.qty
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {editingRowIndex === index ? (
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          className="input-field w-24 text-right"
                          step="0.01"
                        />
                      ) : (
                        `€${item.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      €{item.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {editingRowIndex === index ? (
                          <>
                            <button
                              onClick={handleSaveRow}
                              className="button-primary text-sm py-1 px-2"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingRowIndex(null)}
                              className="button-secondary text-sm py-1 px-2"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditRow(index)}
                              className="button-secondary text-sm py-1 px-2"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => store.removeItem(index)}
                              className="button-danger text-sm py-1 px-2"
                            >
                              {t("common.remove")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("invoice.tax")} (€)
              </label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="input-field"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("invoice.notes")}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                placeholder={t("invoice.notes")}
              />
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span>{t("invoice.subtotal")}:</span>
              <span className="font-bold">€{calculateSubtotal().toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between mb-2">
                <span>{t("invoice.tax")}:</span>
                <span className="font-bold">€{tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg border-t pt-2">
              <span className="font-bold">{t("invoice.total")}:</span>
              <span className="font-bold text-blue-600">
                €{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handlePreview} className="button-primary flex-1">
              {t("invoice.preview")}
            </button>
            <button onClick={handleSaveInvoice} className="button-primary flex-1">
              {t("common.save")}
            </button>
            <a href="/" className="button-secondary flex-1 text-center py-2">
              {t("common.cancel")}
            </a>
          </div>
        </div>
      </div>

      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfUrl={pdfUrl}
      />
    </div>
  );
}
