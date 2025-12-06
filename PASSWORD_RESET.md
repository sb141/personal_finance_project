# Password Reset Feature

## Overview

The password reset feature allows users to reset their forgotten passwords using a secure token-based system.

## How It Works

### 1. Request Password Reset
**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "username": "your_username"
}
```

**Response:**
```json
{
  "message": "Password reset token: <token> (valid for 1 hour). In production, this would be sent via email to the user."
}
```

**Note:** In a production environment, the reset token would be sent via email instead of being returned in the response.

### 2. Reset Password
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "reset_token": "the_token_from_step_1",
  "new_password": "your_new_password"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

## Security Features

1. **Token Expiration**: Reset tokens are valid for 1 hour only
2. **Single Use**: Tokens are invalidated after successful password reset
3. **Username Enumeration Prevention**: The forgot-password endpoint always returns success, even if the username doesn't exist
4. **Secure Token Generation**: Uses cryptographically secure random token generation

## Testing the Feature

### Using cURL (FastAPI - localhost:8000)

```bash
# Step 1: Request password reset
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Step 2: Reset password (use the token from step 1)
curl -X POST http://localhost:8000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"reset_token":"YOUR_TOKEN_HERE","new_password":"newpassword123"}'
```

### Using cURL (PHP - Production)

```bash
# Step 1: Request password reset
curl -X POST https://pf.thehindiblogs.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Step 2: Reset password
curl -X POST https://pf.thehindiblogs.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"reset_token":"YOUR_TOKEN_HERE","new_password":"newpassword123"}'
```

## Database Schema

Both backends (PHP and FastAPI) have been updated with the following fields in the `users` table:

- `reset_token` (VARCHAR/String) - Stores the password reset token
- `reset_token_expiry` (DATETIME/DateTime) - Stores when the token expires

## Production Considerations

⚠️ **Important:** The current implementation returns the reset token in the API response for testing purposes. In a production environment, you should:

1. **Integrate Email Service**: Use an email service (SendGrid, AWS SES, etc.) to send the reset token to the user's email
2. **Add Email Field**: Add an email field to the users table
3. **Create Reset URL**: Send a link like `https://yourapp.com/reset-password?token=<token>` instead of the raw token
4. **Rate Limiting**: Implement rate limiting on the forgot-password endpoint to prevent abuse
5. **Logging**: Log password reset attempts for security auditing

## Error Handling

- **400 Bad Request**: Missing required fields or invalid/expired token
- **401 Unauthorized**: Invalid credentials (login endpoint)
- **409 Conflict**: Username already taken (register endpoint)

## Both Backends Supported

This feature is implemented in both:
- ✅ **FastAPI** (Python) - `backend/routers/auth.py`
- ✅ **PHP** - `backend_php/api.php`

Both implementations are identical in functionality and API contract.
