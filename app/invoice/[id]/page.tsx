"use client";

import InvoiceForm from "@/components/InvoiceForm";
import { useParams } from "next/navigation";

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = parseInt(params.id as string);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">📝 Rechnung bearbeiten</h1>
      <InvoiceForm invoiceId={invoiceId} />
    </div>
  );
}
