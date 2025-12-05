import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const transactionService = {
    // Get all transactions
    getTransactions: async () => {
        const response = await api.get('/transactions/');
        return response.data;
    },

    // Create a new transaction
    createTransaction: async (transaction) => {
        const response = await api.post('/transactions/', transaction);
        return response.data;
    },

    // Get weekly report
    getWeeklyReport: async () => {
        const response = await api.get('/reports/weekly');
        return response.data;
    },
};

export default api;
