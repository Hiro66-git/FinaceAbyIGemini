
export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface MonthlySummary {
    name: string;
    income: number;
    expenses: number;
}
