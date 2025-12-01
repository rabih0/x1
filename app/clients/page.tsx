"use client";

import ClientList from "@/components/ClientList";

export default function ClientsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">👥 Kunden</h1>
      <ClientList />
    </div>
  );
}
