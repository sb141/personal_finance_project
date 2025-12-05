import React, { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import WeeklyReport from './components/WeeklyReport';
import MonthlyReport from './components/MonthlyReport';
import TransactionsTab from './components/TransactionsTab';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Main Dashboard Component
const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState('monthly');
  const { user, logout } = useAuth();

  const handleTransactionChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-slide-in relative">
          <div className="absolute right-0 top-0">
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg backdrop-blur-sm transition-all"
            >
              Sign Out ({user?.username})
            </button>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            💎 Personal Finance Tracker
          </h1>
          <p className="text-white text-lg opacity-90">
            Track your income and expenses with style
          </p>
        </header>

        <div className="animate-fade-in space-y-8">
          {/* View Toggle */}
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
            Built with ❤️ for Personal Finance
          </p>
        </footer>
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-8">
          <div className="max-w-md bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Something went wrong 😵</h2>
            <p className="mb-4">The application crashed. This is likely an API or Rendering issue.</p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 font-semibold"
            >
              Reload Application
            </button>
            <div className="mt-4 text-xs text-gray-500 text-center">
              Try clearing your browser cache/cookies.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Root App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white text-xl font-semibold">💎 Loading Personal Finance...</div>;
  }

  return user ? <Dashboard /> : <Login />;
};

export default App;
