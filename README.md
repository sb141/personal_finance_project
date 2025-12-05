# 💎 Personal Finance Tracker

A modern, full-stack personal finance application designed to help you track your income and expenses with style. It features a beautiful, responsive UI with interactive charts and a robust backend API.

## 🚀 Features

*   **Dashboard Overview**: View your financial health at a glance.
*   **Transaction Management**: Easily add, edit, and delete income and expense transactions.
*   **Smart Filtering**: Filter transactions by specific dates, months, or years.
*   **Visual Reports**:
    *   **Weekly View**: Compare daily credits vs. debits for the last 7 days.
    *   **Monthly View**: Aggregate view of your finances for the entire month.
*   **Responsive Design**: Works seamlessly on desktop and mobile devices.

## 🛠️ Technology Stack

### Frontend
*   **Framework**: [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, modern look.
*   **Charts**: [Recharts](https://recharts.org/) for data visualization.
*   **HTTP Client**: [Axios](https://axios-http.com/).

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) for high-performance API endpoints.
*   **Database**: SQLite (built-in, lightweight) with [SQLAlchemy](https://www.sqlalchemy.org/) ORM.
*   **Validation**: [Pydantic](https://docs.pydantic.dev/) schemas.
*   **Package Manager**: [uv](https://github.com/astral-sh/uv) to manage Python dependencies and environments speed.

## 🏁 Getting Started

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Python** (v3.10 or higher)
*   **uv** (Fast Python package installer and resolver)

### 1. Start the Backend Server

```bash
cd backend

# Install dependencies using uv
uv sync

# Run the server
uv run python -m uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`.

> 💡 **Tip:** Since we are using FastAPI, interactive API documentation is automatically generated. You can access it at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### 2. Start the Frontend Application

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```
c:\skc\Projects\personal_finance_project\
├── backend/            # FastAPI backend code
│   ├── routers/        # API endpoints (transactions, reports)
│   ├── models.py       # Database models
│   ├── schemas.py      # Pydantic data schemas
│   └── main.py         # App entry point
├── frontend/           # React frontend code
│   ├── src/
│   │   ├── components/ # UI Components (Reports, Forms)
│   │   ├── App.jsx     # Main layout
│   │   └── ...
└── README.md           # This file
```