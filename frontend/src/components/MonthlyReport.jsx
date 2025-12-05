import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const MonthlyReport = ({ refresh }) => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, balance: 0 });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchReport = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/reports/monthly?year=${selectedYear}&month=${selectedMonth}`
            );
            const data = await response.json();
            setReportData(data);

            // Calculate summary
            const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);
            const totalDebit = data.reduce((sum, item) => sum + item.debit, 0);
            setSummary({
                totalCredit,
                totalDebit,
                balance: totalCredit - totalDebit,
            });
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchReport();
    }, [refresh, selectedMonth, selectedYear]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(value);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
        <div className="space-y-6">
            {/* Month/Year Selector */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold gradient-text">Monthly Report</h2>
                    <div className="flex gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                        >
                            {months.map((month, index) => (
                                <option key={month} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Credit</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalCredit)}</p>
                            </div>
                            <div className="text-4xl opacity-80">💰</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Debit</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalDebit)}</p>
                            </div>
                            <div className="text-4xl opacity-80">💸</div>
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} text-white p-4 rounded-xl`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Net Balance</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.balance)}</p>
                            </div>
                            <div className="text-4xl opacity-80">📊</div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {reportData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">No data available for {months[selectedMonth - 1]} {selectedYear}</p>
                        <p className="text-sm mt-2">Add transactions to see your monthly report</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                            <Bar
                                dataKey="credit"
                                fill="#10b981"
                                radius={[8, 8, 0, 0]}
                                name="Credit"
                            />
                            <Bar
                                dataKey="debit"
                                fill="#ef4444"
                                radius={[8, 8, 0, 0]}
                                name="Debit"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default MonthlyReport;
