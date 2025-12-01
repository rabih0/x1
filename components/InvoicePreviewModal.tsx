"use client";

import { useTranslation } from "react-i18next";

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
}

export default function InvoicePreviewModal({
  open,
  onClose,
  pdfUrl,
}: InvoicePreviewModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t("invoice.preview")}</h2>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>

        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Invoice PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">{t("common.loading")}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-4">
          <a
            href={pdfUrl}
            download="invoice.pdf"
            className="button-primary"
          >
            {t("invoice.download")}
          </a>
          <button onClick={onClose} className="button-secondary">
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
