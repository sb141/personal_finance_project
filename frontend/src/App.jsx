import { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import WeeklyReport from './components/WeeklyReport';
import MonthlyReport from './components/MonthlyReport';
import TransactionsTab from './components/TransactionsTab';
import './index.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState('monthly'); // 'weekly' or 'monthly'

  const handleTransactionChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-slide-in">
          <h1 className="text-5xl font-bold text-white mb-3">
            💎 Personal Finance Tracker
          </h1>
          <p className="text-white text-lg opacity-90">
            Track your income and expenses with style
          </p>
        </header>

        <div className="animate-fade-in space-y-8">
          {/* View Toggle for Reports */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-lg inline-flex">
              <button
                onClick={() => setActiveView('weekly')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${activeView === 'weekly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                📅 Weekly View
              </button>
              <button
                onClick={() => setActiveView('monthly')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${activeView === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
                  }`}
              >
                📊 Monthly View
              </button>
            </div>
          </div>

          {/* Report Section */}
          <div>
            {activeView === 'weekly' ? (
              <WeeklyReport refresh={refreshKey} />
            ) : (
              <MonthlyReport refresh={refreshKey} />
            )}
          </div>

          {/* Transaction Form Section */}
          <div>
            <TransactionForm onTransactionAdded={handleTransactionChange} />
          </div>

          {/* Full Transactions List Section */}
          <div>
            <TransactionsTab
              refresh={refreshKey}
              onTransactionChange={handleTransactionChange}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-white opacity-75">
          <p className="text-sm">
            Built with ❤️ using FastAPI & React
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
