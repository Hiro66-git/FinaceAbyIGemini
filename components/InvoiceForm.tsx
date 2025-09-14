import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { Invoice, InvoiceItem } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface InvoiceFormProps {
  invoice?: Invoice;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onCancel }) => {
  const { addInvoice, updateInvoice } = useData();
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Pending' as Invoice['status'],
  });
  // Fix: Corrected the type for the items state. The previous type `Omit<InvoiceItem, 'id'> & { id: string}[]`
  // had incorrect operator precedence, leading to numerous type errors. The correct type is `InvoiceItem[]`.
  const [items, setItems] = useState<InvoiceItem[] >([
    { id: Date.now().toString(), description: '', quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
      });
      setItems(invoice.items.map(item => ({...item}))); // create a copy
    }
  }, [invoice]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...items];
    const item = newItems[index] as any;
    item[name] = name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: The `InvoiceItem` type requires an `id`. The previous logic was incorrectly removing it.
    // We now pass the items with their IDs, using the temporary ID from the form as the permanent one.
    const finalItems = items;
    if (invoice) {
      updateInvoice({ ...invoice, ...formData, items: finalItems });
    } else {
      addInvoice({ ...formData, items: finalItems });
    }
    onCancel();
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity || 0), 0);

  return (
    <Card title={invoice ? 'Edit Invoice' : 'Create Invoice'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Client Name" id="clientName" name="clientName" value={formData.clientName} onChange={handleFormChange} required />
          <Input label="Client Email" id="clientEmail" name="clientEmail" type="email" value={formData.clientEmail} onChange={handleFormChange} required />
          <Input label="Issue Date" id="issueDate" name="issueDate" type="date" value={formData.issueDate} onChange={handleFormChange} required />
          <Input label="Due Date" id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleFormChange} required />
        </div>
        
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
            </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-md">
              <div className="col-span-12 sm:col-span-5">
                <Input label="Description" id={`desc-${item.id}`} name="description" value={item.description} onChange={e => handleItemChange(index, e)} required />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Input label="Qty" id={`qty-${item.id}`} name="quantity" type="number" min="0" value={item.quantity} onChange={e => handleItemChange(index, e)} required />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Input label="Price" id={`price-${item.id}`} name="price" type="number" step="0.01" min="0" value={item.price} onChange={e => handleItemChange(index, e)} required />
              </div>
              <div className="col-span-4 sm:col-span-2 text-right">
                <label className="block text-sm font-medium text-gray-700">Total</label>
                <p className="mt-1 py-2 font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
              </div>
              <div className="col-span-12 sm:col-span-1 flex justify-end">
                <Button type="button" variant="danger" onClick={() => removeItem(item.id)} className="w-full sm:w-auto">X</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addItem}>Add Item</Button>
        </div>

        <div className="text-right text-2xl font-bold">
          Total: ${total.toFixed(2)}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{invoice ? 'Save Changes' : 'Create Invoice'}</Button>
        </div>
      </form>
    </Card>
  );
};

export default InvoiceForm;