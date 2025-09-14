import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { Expense } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, expense }) => {
  const { addExpense, updateExpense } = useData();
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: 0,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
      });
    }
  }, [expense, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expense) {
      updateExpense({ ...expense, ...formData });
    } else {
      addExpense(formData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Date" id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        <Input label="Description" id="description" name="description" type="text" value={formData.description} onChange={handleChange} required />
        <Input label="Category" id="category" name="category" type="text" value={formData.category} onChange={handleChange} required />
        <Input label="Amount" id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{expense ? 'Save Changes' : 'Add Expense'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
