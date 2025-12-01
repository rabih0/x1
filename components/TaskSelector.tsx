"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Task, db } from "@/lib/db";

interface TaskSelectorProps {
  selectedIds: number[];
  onTaskSelect: (task: Task) => void;
}

export default function TaskSelector({
  selectedIds,
  onTaskSelect,
}: TaskSelectorProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await db.tasks.toArray();
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const selectedTasks = tasks.filter((t) => selectedIds.includes(t.id || 0));

  return (
    <div className="glass">
      <h3 className="text-xl font-bold mb-4">{t("invoice.select_tasks")}</h3>

      {selectedTasks.length > 0 && (
        <div className="mb-4 space-y-2">
          {selectedTasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div>
                <p className="font-bold">{task.title}</p>
                <p className="text-sm text-gray-600">€{task.unit_price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => onTaskSelect(task)}
                className="button-danger"
              >
                {t("common.remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowList(!showList)}
        className="button-primary w-full mb-4"
      >
        {t("invoice.add_item")}
      </button>

      {showList && (
        <div className="border rounded-lg overflow-hidden">
          {tasks.length === 0 ? (
            <p className="p-4 text-gray-500">{t("task.no_tasks")}</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-start p-4 border-b hover:bg-gray-50 transition-colors last:border-b-0"
                >
                  <div className="flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(task.id || 0)}
                      onChange={() => onTaskSelect(task)}
                      className="mr-3 w-4 h-4"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                    <p className="text-sm text-blue-600 font-bold">
                      €{task.unit_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
