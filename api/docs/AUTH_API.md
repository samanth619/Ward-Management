# Ward Management System - Authentication API Documentation

## Overview

This document describes the RESTful API authentication system for the Ward Management System. The API uses JWT (JSON Web Tokens) for authentication and implements role-based access control (RBAC).

## Authentication Flow

### 1. Token Types
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens
- **Email Verification Token**: 24-hour token for email verification
- **Password Reset Token**: 1-hour token for password resets

### 2. User Roles
- **admin**: Full system access, can manage users, view all wards
- **staff**: Can manage residents and households in their assigned ward
- **read_only**: Can only view data, no create/update/delete permissions

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "staff",
  "ward_number": "WARD001"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff",
      "ward_number": "WARD001",
      "is_active": true,
      "email_verified": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "Bearer",
      "expires_in": 900,
      "expires_at": "2024-01-01T00:15:00.000Z"
    },
    "email_verification_required": true
  }
}
```

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff",
      "ward_number": "WARD001",
      "is_active": true,
      "email_verified": true,
      "last_login": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "Bearer",
      "expires_in": 900,
      "expires_at": "2024-01-01T00:15:00.000Z"
    },
    "email_verified": true
  }
}
```

#### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4. Get Current User Profile
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 5. Update Profile
```http
PUT /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567891",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### 6. Change Password
```http
PUT /auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "current_password": "SecurePass123!",
  "password": "NewSecurePass456!",
  "confirm_password": "NewSecurePass456!"
}
```

#### 7. Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 8. Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "password": "NewSecurePass456!",
  "confirm_password": "NewSecurePass456!"
}
```

#### 9. Verify Email
```http
GET /auth/verify-email/:token
```

#### 10. Logout
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### User Management Endpoints (Admin Only)

#### 1. Get All Users
```http
GET /users?page=1&limit=10&sort=created_at&order=desc&role=staff&ward_number=WARD001
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 2. Get User by ID
```http
GET /users/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 3. Create User (Admin)
```http
POST /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "TempPass123!",
  "role": "staff",
  "ward_number": "WARD002",
  "is_active": true,
  "send_invitation": true
}
```

#### 4. Update User (Admin)
```http
PUT /users/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Jane Smith",
  "role": "read_only",
  "is_active": false
}
```

#### 5. Delete User (Admin)
```http
DELETE /users/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 6. Reset User Password (Admin)
```http
POST /users/:id/reset-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "send_email": true
}
```

#### 7. Get User Statistics (Admin)
```http
GET /users/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Authorization Headers

All protected endpoints require the following header:
```http
Authorization: Bearer <access_token>
```

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "Access denied. Token has expired.",
  "error_code": "TOKEN_EXPIRED"
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Permission Errors
```json
{
  "success": false,
  "message": "Insufficient permissions. Required permission: users:create",
  "error_code": "INSUFFICIENT_PERMISSION",
  "required_permission": "users:create",
  "user_role": "staff"
}
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters, maximum 128 characters
- At least one lowercase letter (a-z)
- At least one uppercase letter (A-Z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

## Rate Limiting

API requests are limited to:
- 100 requests per 15-minute window per IP address
- Additional rate limiting may apply to specific endpoints

## Role-Based Permissions

### Admin Role
- Full system access
- Can create, read, update, delete users
- Can access all wards
- Can view system statistics

### Staff Role
- Can manage residents and households in assigned ward
- Can create and manage conversations
- Can create events and notifications
- Limited to assigned ward data

### Read-Only Role
- Can view residents and households in assigned ward
- Can view conversations and events
- Cannot create, update, or delete any data
- Limited to assigned ward data

## Security Features

1. **JWT Token Security**:
   - Tokens are signed and verified
   - Short-lived access tokens (15 minutes)
   - Secure refresh token mechanism

2. **Password Security**:
   - bcrypt hashing with 12 rounds
   - Strong password requirements
   - Password reset with secure tokens

3. **Input Validation**:
   - Comprehensive validation middleware
   - SQL injection prevention
   - XSS protection

4. **Rate Limiting**:
   - Prevents brute force attacks
   - Configurable limits per endpoint

5. **CORS Protection**:
   - Configured for specific client URLs
   - Credentials support for cross-origin requests

## Environment Variables

Ensure the following environment variables are set:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-that-should-be-very-long-and-random
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_EMAIL_VERIFICATION_EXPIRES_IN=24h
JWT_PASSWORD_RESET_EXPIRES_IN=1h
JWT_ISSUER=ward-management-system
JWT_AUDIENCE=ward-management-users

# Security
BCRYPT_ROUNDS=12

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ward_management_dev
DB_USER=postgres
DB_PASS=password
```

## Testing the API

You can test the API using tools like:
- **Postman**: Import the collection from `/docs/postman_collection.json`
- **curl**: Use the examples provided in this documentation
- **HTTPie**: Alternative command-line HTTP client
- **Insomnia**: REST client with workspace support

## Example Full Authentication Flow

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "TestPass123!",
       "confirm_password": "TestPass123!",
       "role": "staff"
     }'
   ```

2. **Login and get tokens**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPass123!"
     }'
   ```

3. **Use access token for protected endpoints**:
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

4. **Refresh token when needed**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{
       "refresh_token": "YOUR_REFRESH_TOKEN"
     }'
   ```

## Common Issues and Solutions

1. **Token Expired Error**: Use the refresh token to get a new access token
2. **Invalid Credentials**: Check email and password, ensure user is active
3. **Permission Denied**: Verify user role has required permissions
4. **Validation Errors**: Check request payload against validation rules
5. **Rate Limited**: Wait for rate limit window to reset (15 minutes)

For more detailed information or support, please refer to the API source code or contact the development team.