import React, { useState } from 'react';
import api from '../services/api';

const TransactionForm = ({ onTransactionAdded }) => {
    // Helper to get today's date in DD/MM/YYYY format
    const getTodayString = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [formData, setFormData] = useState({
        amount: '',
        type: 'debit',
        category: '',
        description: '',
        date: getTodayString(),
    });
    const [loading, setLoading] = useState(false);

    const parseDateToISO = (dateStr) => {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        try {
            const [day, month, year] = dateStr.split('/');
            if (!day || !month || !year) return null;
            // Ensure proper padding
            const pad = (n) => String(n).padStart(2, '0');
            return `${year}-${pad(month)}-${pad(day)}`;
        } catch (e) {
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isoDate = parseDateToISO(formData.date);
        if (!isoDate) {
            alert('Please enter a valid date in DD/MM/YYYY format');
            setLoading(false);
            return;
        }

        try {
            await api.post('/transactions/', {
                ...formData,
                amount: parseFloat(formData.amount),
                date: isoDate,
            });

            setFormData({
                amount: '',
                type: 'debit',
                category: '',
                description: '',
                date: getTodayString(),
            });
            if (onTransactionAdded) onTransactionAdded();
        } catch (error) {
            console.error('Error creating transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="card animate-slide-in">
            <h2 className="text-2xl font-bold gradient-text mb-6">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date (DD/MM/YYYY)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 05/12/2025"
                                className="input-field pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('hidden-date-picker').showPicker()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                            >
                                📅
                            </button>
                            <input
                                type="date"
                                id="hidden-date-picker"
                                className="invisible absolute bottom-0 left-0 w-0 h-0"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [year, month, day] = e.target.value.split('-');
                                        const newDate = `${day}/${month}/${year}`;
                                        setFormData(prev => ({ ...prev, date: newDate }));
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            step="0.01"
                            min="0"
                            className="input-field"
                            placeholder="Enter amount"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="credit"
                                checked={formData.type === 'credit'}
                                onChange={handleChange}
                                className="mr-2 w-4 h-4 text-green-600"
                            />
                            <span className="text-green-600 font-semibold">💰 Credit</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="debit"
                                checked={formData.type === 'debit'}
                                onChange={handleChange}
                                className="mr-2 w-4 h-4 text-red-600"
                            />
                            <span className="text-red-600 font-semibold">💸 Debit</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category (Optional)
                    </label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Salary, Groceries, Rent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                        placeholder="Add notes about this transaction"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Adding...' : '✨ Add Transaction'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;
