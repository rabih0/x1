"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Client, db } from "@/lib/db";

interface ClientListProps {
  onSelect?: (client: Client) => void;
  selectMode?: boolean;
}

export default function ClientList({ onSelect, selectMode = false }: ClientListProps) {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Client>({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const allClients = await db.clients.toArray();
      setClients(allClients);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await db.clients.update(editingId, formData);
      } else {
        await db.clients.add(formData);
      }
      loadClients();
      resetForm();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("client.confirm_delete"))) {
      try {
        await db.clients.delete(id);
        loadClients();
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", address: "", email: "", phone: "" });
    setEditingId(null);
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id || null);
  };

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass">
        <h3 className="text-xl font-bold mb-4">
          {editingId ? t("client.edit") : t("client.new")}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder={t("client.name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder={t("client.address")}
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="input-field"
          />
          <input
            type="email"
            placeholder={t("client.email")}
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="input-field"
          />
          <input
            type="tel"
            placeholder={t("client.phone")}
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="input-field"
          />
          <div className="flex gap-4">
            <button onClick={handleSave} className="button-primary">
              {t("common.save")}
            </button>
            {editingId && (
              <button onClick={resetForm} className="button-secondary">
                {t("common.cancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass">
        <h3 className="text-xl font-bold mb-4">{t("client.title")}</h3>
        {clients.length === 0 ? (
          <p className="text-gray-500">{t("client.no_clients")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-2">{t("client.name")}</th>
                  <th className="text-left py-2 px-2">{t("client.email")}</th>
                  <th className="text-left py-2 px-2">{t("client.phone")}</th>
                  <th className="text-left py-2 px-2">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="table-row">
                    <td className="py-3 px-2">{client.name}</td>
                    <td className="py-3 px-2">{client.email || "-"}</td>
                    <td className="py-3 px-2">{client.phone || "-"}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        {selectMode && (
                          <button
                            onClick={() => onSelect?.(client)}
                            className="button-primary text-sm"
                          >
                            {t("common.select")}
                          </button>
                        )}
                        {!selectMode && (
                          <>
                            <button
                              onClick={() => handleEdit(client)}
                              className="button-secondary text-sm"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(client.id!)}
                              className="button-danger text-sm"
                            >
                              {t("common.delete")}
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
      </div>
    </div>
  );
}
