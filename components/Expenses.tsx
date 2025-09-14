import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import Card from './ui/Card';
import Button from './ui/Button';
import ExpenseModal from './ExpenseModal';
import { Expense } from '../types';
import { parseReceipt } from '../services/geminiService';

const Expenses: React.FC = () => {
  const { expenses, deleteExpense, addExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleOpenModal = (expense?: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedExpense(undefined);
    setIsModalOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            const base64String = (reader.result as string).split(',')[1];
            const mimeType = file.type;
            const parsedData = await parseReceipt(base64String, mimeType);
            
            addExpense({
                date: parsedData.date || new Date().toISOString().split('T')[0],
                amount: parsedData.amount || 0,
                description: parsedData.description || 'Scanned Receipt',
                category: 'Uncategorized'
            });

        } catch (error) {
            console.error(error);
            setParseError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsParsing(false);
        }
    };
    reader.onerror = (error) => {
        console.error("FileReader error:", error);
        setParseError("Failed to read the file.");
        setIsParsing(false);
    };
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Expenses</h2>
          <div className="flex space-x-2">
            <Button onClick={() => handleOpenModal()}>Add Expense</Button>
            <Button variant="secondary" onClick={() => document.getElementById('receipt-upload')?.click()} disabled={isParsing}>
              {isParsing ? 'Parsing...' : 'Upload Receipt'}
            </Button>
            <input type="file" id="receipt-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
        {parseError && <p className="text-red-500 mt-2">{parseError}</p>}
      </Card>

      <Card>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${expense.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="secondary" onClick={() => handleOpenModal(expense)}>Edit</Button>
                  <Button variant="danger" onClick={() => deleteExpense(expense.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                No expenses recorded yet.
            </div>
        )}
      </Card>
      <ExpenseModal isOpen={isModalOpen} onClose={handleCloseModal} expense={selectedExpense} />
    </div>
  );
};

export default Expenses;
