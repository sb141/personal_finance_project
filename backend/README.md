# FastAPI Backend with Authentication

This is the FastAPI version of the Personal Finance API with full authentication and multi-user support.

## Features

- ✅ User registration and login
- ✅ Token-based authentication (Bearer tokens)
- ✅ Multi-user data isolation
- ✅ Full CRUD operations for transactions
- ✅ Weekly and monthly reports
- ✅ SQLite database with SQLAlchemy ORM

## Setup

### 1. Install uv (if not already installed)

```bash
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Install Dependencies

```bash
cd backend
uv pip install -r requirements.txt
```

### 3. Run the Server

```bash
uv run python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

## API Endpoints

### Authentication (Public)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get auth token

### Transactions (Protected - Requires Bearer Token)
- `GET /transactions/` - Get user's transactions (with optional filters)
- `POST /transactions/` - Create a new transaction
- `PUT /transactions/{id}` - Update a transaction
- `DELETE /transactions/{id}` - Delete a transaction

### Reports (Protected)
- `GET /reports/weekly` - Get weekly report
- `GET /reports/monthly?year=2025&month=12` - Get monthly report

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

The frontend automatically handles this via the `api.js` interceptor.

## Database

The app uses SQLite by default (`finance.db`). The database is created automatically on first run.

### Models

**User**
- id (Primary Key)
- username (Unique)
- password_hash
- api_token
- created_at

**Transaction**
- id (Primary Key)
- user_id (Foreign Key to User)
- amount
- type (credit/debit)
- category
- description
- date

## Frontend Integration

The frontend is already configured to work with this backend. Just make sure:
1. `.env` has `VITE_API_URL=http://localhost:8000`
2. The frontend uses the `api` instance from `services/api.js` (already done)

## Notes

- Passwords are hashed using bcrypt
- Tokens are generated using secure random strings
- Each user can only access their own transactions
- CORS is configured for localhost development
