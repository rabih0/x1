"use client";

import CompanyForm from "@/components/CompanyForm";

export default function CompanyPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">🏢 Firmendaten</h1>
      <CompanyForm />
    </div>
  );
}
