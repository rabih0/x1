"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Invoice, db } from "@/lib/db";
import Link from "next/link";

export default function Home() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const allInvoices = await db.invoices.toArray();
      setInvoices(allInvoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Rechnung wirklich löschen?")) {
      try {
        await db.invoices.delete(id);
        loadInvoices();
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {t("invoice.title")}
          </h1>
          <p className="text-white/80">{t("app.subtitle")}</p>
        </div>
        <Link href="/invoice/new" className="button-primary text-lg py-3">
          ➕ {t("invoice.new")}
        </Link>
      </div>

      <div className="glass">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Noch keine Rechnungen erstellt
            </p>
            <Link href="/invoice/new" className="button-primary">
              {t("invoice.new")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4">{t("invoice.number")}</th>
                  <th className="text-left py-3 px-4">{t("invoice.client")}</th>
                  <th className="text-left py-3 px-4">{t("invoice.date")}</th>
                  <th className="text-right py-3 px-4">{t("invoice.total")}</th>
                  <th className="text-left py-3 px-4">{t("invoice.status")}</th>
                  <th className="text-left py-3 px-4">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="table-row">
                    <td className="py-4 px-4 font-medium">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-4 px-4">{invoice.client_snapshot.name}</td>
                    <td className="py-4 px-4">
                      {invoice.createdAt
                        ? new Date(invoice.createdAt).toLocaleDateString("de-DE")
                        : "-"}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-blue-600">
                      €{invoice.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status === "paid"
                          ? "Bezahlt"
                          : invoice.status === "sent"
                          ? "Versendet"
                          : "Entwurf"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/invoice/${invoice.id}`}
                          className="button-secondary text-sm py-1"
                        >
                          {t("common.edit")}
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id!)}
                          className="button-danger text-sm py-1"
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
