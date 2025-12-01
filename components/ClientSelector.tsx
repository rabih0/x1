"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Client, db } from "@/lib/db";
import { useInvoiceForm } from "@/lib/store";

interface ClientSelectorProps {
  selectedClient: Client | null;
}

export default function ClientSelector({
  selectedClient,
}: ClientSelectorProps) {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [showList, setShowList] = useState(false);
  const store = useInvoiceForm();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const allClients = await db.clients.toArray();
      setClients(allClients);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  return (
    <div className="glass">
      <h3 className="text-xl font-bold mb-4">{t("invoice.select_client")}</h3>

      {selectedClient ? (
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="font-bold text-lg">{selectedClient.name}</p>
            {selectedClient.address && (
              <p className="text-sm text-gray-600">{selectedClient.address}</p>
            )}
            {selectedClient.email && (
              <p className="text-sm text-gray-600">{selectedClient.email}</p>
            )}
          </div>
          <button
            onClick={() => {
              store.setSelectedClient(null);
              setShowList(false);
            }}
            className="button-secondary"
          >
            {t("common.remove")}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowList(!showList)}
            className="button-primary w-full mb-4"
          >
            {t("invoice.select_client")}
          </button>

          {showList && (
            <div className="border rounded-lg overflow-hidden">
              {clients.length === 0 ? (
                <p className="p-4 text-gray-500">{t("client.no_clients")}</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        store.setSelectedClient(client);
                        setShowList(false);
                      }}
                      className="w-full text-left p-4 border-b hover:bg-gray-50 transition-colors last:border-b-0"
                    >
                      <p className="font-bold">{client.name}</p>
                      {client.address && (
                        <p className="text-sm text-gray-600">{client.address}</p>
                      )}
                      {client.email && (
                        <p className="text-sm text-gray-600">{client.email}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
