import React, { useState, useEffect } from 'react';

const TransactionList = ({ refresh, onDelete }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/transactions/');
            const data = await response.json();
            setTransactions(data.reverse()); // Show newest first
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [refresh]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/transactions/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh the list
                if (onDelete) onDelete();
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction');
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="card animate-slide-in">
            <h2 className="text-2xl font-bold gradient-text mb-6">Recent Transactions</h2>

            {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No transactions yet</p>
                    <p className="text-sm mt-2">Add your first transaction to get started!</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {transaction.type === 'credit' ? '💰' : '💸'}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {transaction.description || 'No description'}
                                        </p>
                                        {transaction.category && (
                                            <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                {transaction.category}
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p
                                        className={`text-xl font-bold ${transaction.type === 'credit'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                    >
                                        {transaction.type === 'credit' ? '+' : '-'}
                                        {formatAmount(transaction.amount)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(transaction.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:scale-110"
                                    title="Delete transaction"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionList;
