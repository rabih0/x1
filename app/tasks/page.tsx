"use client";

import TaskList from "@/components/TaskList";

export default function TasksPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">📋 Aufgaben</h1>
      <TaskList />
    </div>
  );
}
