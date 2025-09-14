import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { Expense, Invoice, MonthlySummary } from '../types';

interface DataContextType {
  expenses: Expense[];
  invoices: Invoice[];
  monthlySummary: MonthlySummary[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialExpenses: Expense[] = [];
const initialInvoices: Invoice[] = [];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [{ ...expense, id: Date.now().toString() }, ...prev]);
  }, []);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => prev.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense));
  }, []);

  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  }, []);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoiceNumber = `INV-${(invoices.length + 1).toString().padStart(3, '0')}`;
    setInvoices(prev => [{ ...invoice, id: Date.now().toString(), invoiceNumber: newInvoiceNumber }, ...prev]);
  }, [invoices.length]);
  
  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(invoice => invoice.id === updatedInvoice.id ? updatedInvoice : invoice));
  }, []);

  const deleteInvoice = useCallback((invoiceId: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
  }, []);

  const monthlySummary = useMemo<MonthlySummary[]>(() => {
    const summary: { [key: string]: { income: number, expenses: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${monthNames[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
        if (!summary[monthKey]) summary[monthKey] = { income: 0, expenses: 0 };
        summary[monthKey].expenses += exp.amount;
    });

    invoices.forEach(inv => {
        if (inv.status === 'Paid') {
            const date = new Date(inv.issueDate);
            const monthKey = `${monthNames[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
            if (!summary[monthKey]) summary[monthKey] = { income: 0, expenses: 0 };
            const total = inv.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            summary[monthKey].income += total;
        }
    });

    return Object.keys(summary).map(key => ({
        name: key,
        income: summary[key].income,
        expenses: summary[key].expenses
    }));
  }, [expenses, invoices]);

  const value = { expenses, invoices, addExpense, updateExpense, deleteExpense, addInvoice, updateInvoice, deleteInvoice, monthlySummary };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};