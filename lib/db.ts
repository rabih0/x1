import Dexie, { Table } from "dexie";

export interface Task {
  id?: number;
  title: string;
  unit_price: number;
  description?: string;
  createdAt?: Date;
}

export interface Client {
  id?: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
}

export interface CompanyInfo {
  id?: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  vat?: string;
  logo_base64?: string;
  website?: string;
  createdAt?: Date;
}

export interface InvoiceItem {
  taskId?: number;
  title: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  client_id: number;
  client_snapshot: Client;
  company_snapshot: CompanyInfo;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid';
  createdAt?: Date;
  dueDate?: Date;
}

class AppDB extends Dexie {
  tasks!: Table<Task>;
  clients!: Table<Client>;
  company!: Table<CompanyInfo>;
  invoices!: Table<Invoice>;

  constructor() {
    super("InvoiceDB");
    this.version(1).stores({
      tasks: "++id,title",
      clients: "++id,name",
      company: "++id",
      invoices: "++id,invoice_number"
    });
  }
}

export const db = new AppDB();
