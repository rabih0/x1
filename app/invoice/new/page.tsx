"use client";

import InvoiceForm from "@/components/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">📄 Neue Rechnung</h1>
      <InvoiceForm />
    </div>
  );
}
