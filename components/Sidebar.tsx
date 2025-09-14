import React from 'react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'expenses' | 'invoices') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'invoices', label: 'Invoices' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-2xl font-bold">
        FinDash
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as 'dashboard' | 'expenses' | 'invoices')}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
              currentView === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
