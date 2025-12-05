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

const WeeklyReport = ({ refresh }) => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, balance: 0 });

    const fetchReport = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/weekly`);
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
        fetchReport();
    }, [refresh]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(value);
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
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-green-400 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Credit</p>
                            <p className="text-3xl font-bold mt-2">{formatCurrency(summary.totalCredit)}</p>
                        </div>
                        <div className="text-5xl opacity-80">💰</div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-red-400 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Debit</p>
                            <p className="text-3xl font-bold mt-2">{formatCurrency(summary.totalDebit)}</p>
                        </div>
                        <div className="text-5xl opacity-80">💸</div>
                    </div>
                </div>

                <div className={`card bg-gradient-to-br ${summary.balance >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Net Balance</p>
                            <p className="text-3xl font-bold mt-2">{formatCurrency(summary.balance)}</p>
                        </div>
                        <div className="text-5xl opacity-80">📊</div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card animate-slide-in">
                <h2 className="text-2xl font-bold gradient-text mb-6">Weekly Overview</h2>

                {reportData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">No data available</p>
                        <p className="text-sm mt-2">Add transactions to see your weekly report</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
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

export default WeeklyReport;
