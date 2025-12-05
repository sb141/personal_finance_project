import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TransactionsTab = ({ refresh, onTransactionChange }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('month'); // 'month' or 'date'

    // Filters
    const d = new Date();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(d.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(d.getFullYear());

    // Edit State
    const [editingTx, setEditingTx] = useState(null); // The transaction being edited

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = { limit: 1000 };

            if (filterType === 'date' && selectedDate) {
                params.date = selectedDate;
            } else if (filterType === 'month') {
                params.month = selectedMonth;
                params.year = selectedYear;
            }

            const response = await api.get('/transactions/', { params });
            setTransactions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterType, selectedDate, selectedMonth, selectedYear, refresh]);


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
            if (onTransactionChange) onTransactionChange();
        } catch (error) {
            alert('Failed to delete transaction');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/transactions/${editingTx.id}`, {
                amount: parseFloat(editingTx.amount),
                type: editingTx.type,
                category: editingTx.category,
                description: editingTx.description,
                date: editingTx.date,
            });

            setEditingTx(null);
            fetchTransactions();
            if (onTransactionChange) onTransactionChange();
        } catch (error) {
            console.error(error);
            alert('Error updating transaction');
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-slide-in">
            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold gradient-text">All Transactions</h2>

                    <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-2 rounded-xl">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterType('month')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === 'month'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Month View
                            </button>
                            <button
                                onClick={() => setFilterType('date')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === 'date'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Date View
                            </button>
                        </div>

                        {filterType === 'month' ? (
                            <div className="flex gap-2">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {months.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Editing Modal Overlay */}
            {editingTx && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-4">Edit Transaction</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={editingTx.type === 'credit'}
                                            onChange={() => setEditingTx({ ...editingTx, type: 'credit' })}
                                            className="text-purple-600"
                                        />
                                        <span>Credit</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={editingTx.type === 'debit'}
                                            onChange={() => setEditingTx({ ...editingTx, type: 'debit' })}
                                            className="text-purple-600"
                                        />
                                        <span>Debit</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    value={editingTx.amount}
                                    onChange={(e) => setEditingTx({ ...editingTx, amount: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <input
                                    type="text"
                                    value={editingTx.category || ''}
                                    onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input
                                    type="text"
                                    value={editingTx.description || ''}
                                    onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            {/* Date Field for Edit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={editingTx.date ? editingTx.date.split('T')[0] : ''}
                                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingTx(null)}
                                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="card">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No transactions found for this period.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium text-right">Amount</th>
                                    <th className="p-4 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(tx.date)}
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">
                                            {tx.description || '-'}
                                        </td>
                                        <td className="p-4">
                                            {tx.category && (
                                                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                                                    {tx.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className={`p-4 text-right font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} {formatAmount(tx.amount)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingTx(tx)}
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsTab;
