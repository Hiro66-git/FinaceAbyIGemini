import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Invoice } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import InvoiceForm from './InvoiceForm';

const Invoices: React.FC = () => {
  const { invoices, deleteInvoice } = useData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);

  const handleOpenForm = (invoice?: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setSelectedInvoice(undefined);
    setIsFormVisible(false);
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
    }
  };

  if (isFormVisible) {
    return <InvoiceForm invoice={selectedInvoice} onCancel={handleCloseForm} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <Button onClick={() => handleOpenForm()}>Create Invoice</Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map(invoice => (
          <Card key={invoice.id} className="flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">{invoice.clientName}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <div className="mt-4 flex-grow">
              <p className="text-sm text-gray-500">Issued: {invoice.issueDate}</p>
              <p className="text-sm text-gray-500">Due: {invoice.dueDate}</p>
              <p className="text-2xl font-bold mt-2">
                ${invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => handleOpenForm(invoice)}>Edit</Button>
              <Button variant="danger" onClick={() => deleteInvoice(invoice.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      {invoices.length === 0 && (
        <Card>
            <div className="text-center py-8 text-gray-500">
                No invoices created yet.
            </div>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
