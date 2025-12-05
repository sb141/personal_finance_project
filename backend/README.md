# 🔙 Personal Finance API

This is the backend service for the Personal Finance Tracker, built with **FastAPI**. It manages the SQLite database and provides RESTful endpoints for the frontend.

We use **[uv](https://github.com/astral-sh/uv)** for high-performance dependency management.

## ⚙️ Setup & Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies and sync environment:**
    ```bash
    uv sync
    ```
    This command will create the virtual environment (`.venv`) and install all required packages defined in `pyproject.toml` or `uv.lock`.

3.  **Run the server:**
    ```bash
    uv run uvicorn main:app --reload
    ```
    The server will start at `http://127.0.0.1:8000`.

    > 📘 **Interactive Docs:** Visit **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** to explore and test the API endpoints interactively.

## 📚 API Endpoints

### Transactions

*   **`POST /transactions/`**: Create a new transaction.
    *   Body: `{ "date": "YYYY-MM-DD", "amount": 100.0, "type": "credit/debit", "category": "Food", "description": "..." }`
*   **`GET /transactions/`**: Retrieve a list of transactions.
    *   Query Params: `skip`, `limit`, `year`, `month`, `date`.
*   **`PUT /transactions/{id}`**: Update an existing transaction.
*   **`DELETE /transactions/{id}`**: Delete a transaction.

### Reports

*   **`GET /reports/weekly`**: Get aggregated credit/debit data for the last 7 days.
*   **`GET /reports/monthly`**: Get aggregated credit/debit data for a specific month (defaults to current).

## 🗄️ Database

The project uses **SQLite**.
*   The database file `personal_finance.db` is automatically created in the `backend/` directory upon the first run.
*   **SQLAlchemy** is used as the ORM to manage `Transaction` models.
