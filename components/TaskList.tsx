"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Task, db } from "@/lib/db";

interface TaskListProps {
  onSelect?: (task: Task) => void;
  selectMode?: boolean;
  selectedIds?: number[];
}

export default function TaskList({
  onSelect,
  selectMode = false,
  selectedIds = [],
}: TaskListProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Task>({
    title: "",
    unit_price: 0,
    description: "",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await db.tasks.toArray();
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || formData.unit_price <= 0) return;

    try {
      if (editingId) {
        await db.tasks.update(editingId, formData);
      } else {
        await db.tasks.add(formData);
      }
      loadTasks();
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("task.confirm_delete"))) {
      try {
        await db.tasks.delete(id);
        loadTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: "", unit_price: 0, description: "" });
    setEditingId(null);
  };

  const handleEdit = (task: Task) => {
    setFormData(task);
    setEditingId(task.id || null);
  };

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {!selectMode && (
        <div className="glass">
          <h3 className="text-xl font-bold mb-4">
            {editingId ? t("task.edit") : t("task.new")}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t("task.title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="input-field"
            />
            <input
              type="text"
              placeholder={t("task.description")}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field"
            />
            <input
              type="number"
              placeholder={t("task.unit_price")}
              value={formData.unit_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unit_price: parseFloat(e.target.value) || 0,
                })
              }
              className="input-field"
              step="0.01"
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
      )}

      <div className="glass">
        <h3 className="text-xl font-bold mb-4">{t("task.title")}</h3>
        {tasks.length === 0 ? (
          <p className="text-gray-500">{t("task.no_tasks")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  {selectMode && <th className="text-left py-2 px-2">✓</th>}
                  <th className="text-left py-2 px-2">{t("task.title")}</th>
                  <th className="text-left py-2 px-2">
                    {t("task.description")}
                  </th>
                  <th className="text-left py-2 px-2">{t("task.unit_price")}</th>
                  <th className="text-left py-2 px-2">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="table-row">
                    {selectMode && (
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(task.id!)}
                          onChange={() => onSelect?.(task)}
                          className="w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="py-3 px-2">{task.title}</td>
                    <td className="py-3 px-2">{task.description || "-"}</td>
                    <td className="py-3 px-2">€{task.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        {!selectMode && (
                          <>
                            <button
                              onClick={() => handleEdit(task)}
                              className="button-secondary text-sm"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(task.id!)}
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
