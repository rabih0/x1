import { create } from "zustand";
import { Invoice, Client, Task, CompanyInfo, InvoiceItem } from "./db";

interface InvoiceFormState {
  selectedClient: Client | null;
  selectedTasks: Task[];
  items: InvoiceItem[];
  notes: string;
  tax: number;

  setSelectedClient: (client: Client | null) => void;
  addSelectedTask: (task: Task) => void;
  removeSelectedTask: (taskId: number) => void;
  updateItem: (index: number, item: InvoiceItem) => void;
  removeItem: (index: number) => void;
  addItem: (item: InvoiceItem) => void;
  setNotes: (notes: string) => void;
  setTax: (tax: number) => void;
  reset: () => void;
}

export const useInvoiceForm = create<InvoiceFormState>((set) => ({
  selectedClient: null,
  selectedTasks: [],
  items: [],
  notes: "",
  tax: 0,

  setSelectedClient: (client) => set({ selectedClient: client }),

  addSelectedTask: (task) =>
    set((state) => {
      const exists = state.selectedTasks.some((t) => t.id === task.id);
      if (!exists) {
        const newItem: InvoiceItem = {
          taskId: task.id,
          title: task.title,
          qty: 1,
          price: task.unit_price,
          total: task.unit_price
        };
        return {
          selectedTasks: [...state.selectedTasks, task],
          items: [...state.items, newItem]
        };
      }
      return state;
    }),

  removeSelectedTask: (taskId) =>
    set((state) => ({
      selectedTasks: state.selectedTasks.filter((t) => t.id !== taskId),
      items: state.items.filter((item) => item.taskId !== taskId)
    })),

  updateItem: (index, item) =>
    set((state) => {
      const newItems = [...state.items];
      newItems[index] = item;
      return { items: newItems };
    }),

  removeItem: (index) =>
    set((state) => {
      const item = state.items[index];
      return {
        items: state.items.filter((_, i) => i !== index),
        selectedTasks: state.selectedTasks.filter((t) => t.id !== item.taskId)
      };
    }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item]
    })),

  setNotes: (notes) => set({ notes }),

  setTax: (tax) => set({ tax }),

  reset: () =>
    set({
      selectedClient: null,
      selectedTasks: [],
      items: [],
      notes: "",
      tax: 0
    })
}));
