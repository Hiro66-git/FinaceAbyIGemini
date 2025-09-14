import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Invoices from './components/Invoices';
import { DataProvider } from './hooks/useData';

type View = 'dashboard' | 'expenses' | 'invoices';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses />;
      case 'invoices':
        return <Invoices />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'expenses':
        return 'Expenses';
      case 'invoices':
        return 'Invoices';
      default:
        return 'Dashboard';
    }
  }

  return (
    <DataProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getTitle()} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
};

export default App;
