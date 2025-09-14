import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import Card from './ui/Card';
import { generateFinancialInsight } from '../services/geminiService';
import Button from './ui/Button';

// Mock chart component
const MonthlySummaryChart = ({ data }: { data: { name: string, income: number, expenses: number }[] }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-8">No data available for chart.</div>;
    }
    const maxVal = Math.max(...data.map(d => d.income), ...data.map(d => d.expenses));
    
    // A real implementation would use a library like Recharts or Chart.js
    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-center mb-4">Monthly Summary (Income vs Expenses)</h4>
            <div className="flex justify-around items-end h-64 bg-white p-4 border">
                {data.map(month => (
                    <div key={month.name} className="flex flex-col items-center w-1/12">
                        <div className="flex items-end h-full">
                            <div className="bg-green-400" title={`Income: $${month.income.toFixed(2)}`} style={{ height: `${(month.income / maxVal) * 100}%`, width: '15px', marginRight: '2px' }}></div>
                            <div className="bg-red-400" title={`Expenses: $${month.expenses.toFixed(2)}`} style={{ height: `${(month.expenses / maxVal) * 100}%`, width: '15px' }}></div>
                        </div>
                        <span className="text-xs mt-2 text-center">{month.name}</span>
                    </div>
                ))}
            </div>
             <div className="flex justify-center mt-4 space-x-4 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 bg-green-400 mr-2"></div>Income</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-red-400 mr-2"></div>Expenses</div>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
  const { expenses, invoices, monthlySummary } = useData();
  const [insight, setInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const totalIncome = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.items.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0), 0);

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const handleGenerateInsight = async () => {
    if (expenses.length === 0) {
      setInsight("Not enough expense data to generate an insight.");
      return;
    }
    setIsLoadingInsight(true);
    try {
        const generatedInsight = await generateFinancialInsight(expenses);
        setInsight(generatedInsight);
    } catch (error) {
        setInsight('Could not generate an insight at this time.');
    } finally {
        setIsLoadingInsight(false);
    }
  };

  useEffect(() => {
    handleGenerateInsight();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses.length]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Income">
          <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
        </Card>
        <Card title="Total Expenses">
          <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
        </Card>
        <Card title="Net Profit">
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${netProfit.toFixed(2)}
          </p>
        </Card>
      </div>
      
      <Card title="AI Financial Insight">
        <div className="flex items-center justify-between">
            <p className="text-gray-700 italic pr-4">
                {isLoadingInsight ? 'Generating...' : (insight || 'Generate an insight based on your expense data.')}
            </p>
            <Button onClick={handleGenerateInsight} disabled={isLoadingInsight || expenses.length === 0}>
                {isLoadingInsight ? '...' : 'Regenerate'}
            </Button>
        </div>
      </Card>

      <Card title="Cash Flow">
        <MonthlySummaryChart data={monthlySummary} />
      </Card>
    </div>
  );
};

export default Dashboard;
