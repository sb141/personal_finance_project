# 🖥️ Personal Finance Dashboard

The frontend for the Personal Finance Tracker, built with **React**, **Vite**, and **Tailwind CSS**. It provides a modern, interactive interface for managing your finances.

## 🚀 Setup & Usage

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

## 🧩 Key Components

*   **`App.jsx`**: The main layout container. Handles global state (`activeView`, `refreshKey`) and orchestrates the dashboard.
*   **`TransactionForm.jsx`**: A form to input new transactions. Validates input and triggers updates.
*   **`TransactionsTab.jsx`**: The main data table.
    *   Displays a list of transactions.
    *   Supports filtering by Year, Month, or Date.
    *   Allows editing and deleting transactions.
*   **`WeeklyReport.jsx`**: Displays a bar chart comparing income vs. expenses for the last 7 days.
*   **`MonthlyReport.jsx`**: Displays a similar chart for the entire month.

## 🎨 Styles

*   **Framework**: Tailwind CSS (configured in `tailwind.config.js`).
*   **Design System**:
    *   Uses a vibrant purple/indigo color scheme.
    *   Implements glassmorphism effects and smooth transitions.
    *   Responsive layout for various screen sizes.
