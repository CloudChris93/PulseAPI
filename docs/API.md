# PulseAPI API Documentation

**Version:** v1  
**Production service:** `https://pulseapi-9ect.onrender.com`  
**Production API base URL:** `https://pulseapi-9ect.onrender.com/api`

This document is the consolidated API reference for the current PulseAPI backend. It is intended to be the single handoff reference for frontend integration.

---

## 1. API Overview

PulseAPI provides endpoints for:

- user authentication
- project management
- API usage-event ingestion
- analytics
- project log retrieval

All application endpoints return JSON.

### Health check

```http
GET /api/health
```

Full URL:

```text
https://pulseapi-9ect.onrender.com/api/health
```

No authentication is required.

Example:

```json
{
  "success": true,
  "message": "PulseAPI API is healthy",
  "data": {
    "status": "ok"
  }
}
```

---

## 2. Authentication

PulseAPI has two separate authentication mechanisms.

### 2.1 User authentication — JWT

Use JWT for dashboard and project-management requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

### 2.2 Project authentication — API key

Use a project's API key only when a monitored API sends an event to the ingestion endpoint:

```http
x-api-key: <PROJECT_API_KEY>
```

Do not use the project API key as a Bearer token.

---

## 3. General Response Format

### Success

```json
{
  "success": true,
  "message": "Description of result",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Description of error",
  "data": null
}
```

The frontend should use the HTTP status and response structure for handling errors rather than depending on exact message text.

---

# 4. Authentication Endpoints

## 4.1 Register

```http
POST /auth/register
```

Full URL:

```text
https://pulseapi-9ect.onrender.com/api/auth/register
```

Authentication: none.

### Body

```json
{
  "name": "Christopher",
  "email": "christopher@example.com",
  "password": "password123"
}
```

### Validation

- `name`, `email`, and `password` are required.
- Email must be valid.
- Password must contain at least 6 characters.
- Duplicate email returns `409`.
- Email is stored lowercase.

### Success

**201 Created**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "<USER_ID>",
      "name": "Christopher",
      "email": "christopher@example.com"
    },
    "token": "<JWT_TOKEN>"
  }
}
```

---

## 4.2 Login

```http
POST /auth/login
```

Full URL:

```text
https://pulseapi-9ect.onrender.com/api/auth/login
```

Authentication: none.

### Body

```json
{
  "email": "christopher@example.com",
  "password": "password123"
}
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "<USER_ID>",
      "name": "Christopher",
      "email": "christopher@example.com"
    },
    "token": "<JWT_TOKEN>"
  }
}
```

### Invalid credentials

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

---

## 4.3 Current User

```http
GET /auth/me
```

Authentication:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Authenticated user retrieved successfully",
  "data": {
    "user": {
      "id": "<USER_ID>",
      "name": "Christopher",
      "email": "christopher@example.com"
    }
  }
}
```

The password is never returned.

---

# 5. Project Endpoints

All project endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Project access is restricted to the authenticated user's own projects.

## 5.1 Create Project

```http
POST /projects
```

### Body

```json
{
  "name": "My Store API",
  "description": "My monitored API"
}
```

`description` may be an empty string.

### Success

**201 Created**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "<PROJECT_ID>",
      "name": "My Store API",
      "description": "My monitored API",
      "apiKey": "<PROJECT_API_KEY>",
      "active": true,
      "createdAt": "<ISO_TIMESTAMP>"
    }
  }
}
```

The generated `apiKey` identifies this monitored project when sending ingestion events.

---

## 5.2 List Projects

```http
GET /projects
```

### Success

**200 OK**

The current backend returns MongoDB project documents in this response:

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "_id": "<PROJECT_ID>",
        "owner": "<USER_ID>",
        "name": "My Store API",
        "description": "My monitored API",
        "apiKey": "<PROJECT_API_KEY>",
        "active": true,
        "createdAt": "<ISO_TIMESTAMP>",
        "updatedAt": "<ISO_TIMESTAMP>",
        "__v": 0
      }
    ]
  }
}
```

The frontend API adapter normalizes `_id` and `id` to the application's internal `_id` project identifier.

---

## 5.3 Get Project

```http
GET /projects/:id
```

Example:

```text
GET /projects/<PROJECT_ID>
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "project": {
      "_id": "<PROJECT_ID>",
      "owner": "<USER_ID>",
      "name": "My Store API",
      "description": "My monitored API",
      "apiKey": "<PROJECT_API_KEY>",
      "active": true,
      "createdAt": "<ISO_TIMESTAMP>",
      "updatedAt": "<ISO_TIMESTAMP>",
      "__v": 0
    }
  }
}
```

---

## 5.4 Update Project

```http
PATCH /projects/:id
```

### Body

All fields are optional:

```json
{
  "name": "Updated Store API",
  "description": "Updated description",
  "active": false
}
```

The project owner and API key are not editable.

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "_id": "<PROJECT_ID>",
      "owner": "<USER_ID>",
      "name": "Updated Store API",
      "description": "Updated description",
      "apiKey": "<PROJECT_API_KEY>",
      "active": false,
      "createdAt": "<ISO_TIMESTAMP>",
      "updatedAt": "<ISO_TIMESTAMP>",
      "__v": 0
    }
  }
}
```

---

## 5.5 Delete Project

```http
DELETE /projects/:id
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

---

# 6. API Log Ingestion

A monitored API sends a usage event to PulseAPI for each request it wants to track.

```http
POST /ingest
```

Full URL:

```text
https://pulseapi-9ect.onrender.com/api/ingest
```

Authentication:

```http
x-api-key: <PROJECT_API_KEY>
```

No JWT is required for this endpoint.

### Body

```json
{
  "method": "GET",
  "endpoint": "/api/products",
  "statusCode": 200,
  "responseTime": 143,
  "timestamp": "2026-09-25T10:30:00Z"
}
```

### Fields

| Field | Type | Required | Rules |
|---|---|---:|---|
| `method` | string | Yes | HTTP method such as `GET`, `POST`, `DELETE` |
| `endpoint` | string | Yes | Requested API route |
| `statusCode` | number | Yes | Must be between `100` and `599` |
| `responseTime` | number | Yes | Milliseconds; must be `>= 0` |
| `timestamp` | ISO date string | No | Defaults to server time when omitted |

### Success

**201 Created**

```json
{
  "success": true,
  "message": "API log ingested successfully",
  "data": {
    "log": {
      "project": "<PROJECT_ID>",
      "method": "GET",
      "endpoint": "/api/products",
      "statusCode": 200,
      "responseTime": 143,
      "timestamp": "2026-09-25T10:30:00Z",
      "_id": "<LOG_ID>",
      "__v": 0
    }
  }
}
```

### Error classification

For analytics:

```text
statusCode >= 400
```

is considered an error.

### Validation errors

Missing required data:

**400 Bad Request**

```json
{
  "success": false,
  "message": "method, endpoint, statusCode and responseTime are required",
  "data": null
}
```

Invalid status code:

```json
{
  "success": false,
  "message": "statusCode must be between 100 and 599",
  "data": null
}
```

Negative response time:

```json
{
  "success": false,
  "message": "responseTime cannot be negative",
  "data": null
}
```

---

# 7. Analytics

All analytics endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

The authenticated user must own the project.

Analytics are calculated from the stored `ApiLog` records.

---

## 7.1 Summary

```http
GET /projects/:id/analytics/summary
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Analytics summary retrieved successfully",
  "data": {
    "totalRequests": 6,
    "successfulRequests": 4,
    "errors": 2,
    "errorRate": 33.33,
    "averageResponseTime": 235.83
  }
}
```

### Fields

- `totalRequests`: all stored logs for the project.
- `successfulRequests`: logs with `statusCode < 400`.
- `errors`: logs with `statusCode >= 400`.
- `errorRate`: `(errors / totalRequests) * 100`, rounded to 2 decimals.
- `averageResponseTime`: average response time in milliseconds, rounded to 2 decimals.

---

## 7.2 Time-Series

```http
GET /projects/:id/analytics/timeseries
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Analytics time-series retrieved successfully",
  "data": {
    "points": [
      {
        "requests": 6,
        "date": "2026-09-30"
      }
    ]
  }
}
```

Each point represents the number of recorded requests grouped by calendar date.

---

## 7.3 Endpoint Analytics

```http
GET /projects/:id/analytics/endpoints
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Endpoint analytics retrieved successfully",
  "data": {
    "endpoints": [
      {
        "requests": 2,
        "errors": 0,
        "method": "GET",
        "endpoint": "/api/orders",
        "averageResponseTime": 122.5
      }
    ]
  }
}
```

The aggregation is grouped by HTTP method + endpoint.

---

# 8. Project Logs

```http
GET /projects/:id/logs
```

Authentication:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Query parameters

| Parameter | Type | Required | Default | Rules |
|---|---|---:|---:|---|
| `page` | integer | No | `1` | Must be `>= 1` |
| `limit` | integer | No | `20` | Must be `1`–`100` |
| `method` | string | No | — | Case-insensitive in practice; normalized to uppercase |
| `statusCode` | integer | No | — | Must be `100`–`599` |

### Examples

```text
GET /projects/<PROJECT_ID>/logs
```

```text
GET /projects/<PROJECT_ID>/logs?page=2&limit=10
```

```text
GET /projects/<PROJECT_ID>/logs?method=GET
```

```text
GET /projects/<PROJECT_ID>/logs?statusCode=500
```

```text
GET /projects/<PROJECT_ID>/logs?page=1&limit=20&method=POST&statusCode=500
```

### Success

**200 OK**

```json
{
  "success": true,
  "message": "Project logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "<LOG_ID>",
        "method": "GET",
        "endpoint": "/api/orders",
        "statusCode": 200,
        "responseTime": 145,
        "timestamp": "<ISO_TIMESTAMP>"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

Logs are returned newest first.

### Pagination errors

`page=0` or another non-positive/non-integer page:

**400 Bad Request**

```json
{
  "success": false,
  "message": "page must be a positive integer",
  "data": null
}
```

A `limit` below 1, above 100, or non-integer:

```json
{
  "success": false,
  "message": "limit must be between 1 and 100",
  "data": null
}
```

### Invalid status-code filter

```json
{
  "success": false,
  "message": "statusCode must be between 100 and 599",
  "data": null
}
```

---

# 9. Authorization and Ownership

For JWT-protected project endpoints:

1. the JWT identifies the logged-in user;
2. the requested project must belong to that user;
3. an inaccessible project is returned as:

**404 Not Found**

```json
{
  "success": false,
  "message": "Project not found",
  "data": null
}
```

For ingestion:

1. the `x-api-key` identifies the project;
2. the project must exist;
3. the project must be active;
4. inactive projects cannot ingest new logs.

Missing API key:

**401**

```json
{
  "success": false,
  "message": "API key is required",
  "data": null
}
```

Invalid API key:

**401**

```json
{
  "success": false,
  "message": "Invalid API key",
  "data": null
}
```

Inactive project:

**403**

```json
{
  "success": false,
  "message": "Project is inactive",
  "data": null
}
```

---

# 10. HTTP Status Codes

| Status | Meaning |
|---:|---|
| `200` | Successful request |
| `201` | Resource or log created |
| `400` | Invalid input / validation error |
| `401` | Missing or invalid authentication |
| `403` | Authenticated request is forbidden |
| `404` | Resource/project/route not found |
| `409` | Conflict, such as duplicate email |
| `500` | Unexpected server error |

---

# 11. Frontend Integration

Set the frontend environment variable to:

```env
VITE_API_BASE_URL=https://pulseapi-9ect.onrender.com/api
```

Do not hard-code the API URL inside individual pages.

### JWT requests

Send:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Ingestion requests

Send:

```http
x-api-key: <PROJECT_API_KEY>
```

### Frontend API mapping

| Frontend function | Backend endpoint |
|---|---|
| Login | `POST /auth/login` |
| Register | `POST /auth/register` |
| Current user | `GET /auth/me` |
| Load projects | `GET /projects` |
| Create project | `POST /projects` |
| Update project | `PATCH /projects/:id` |
| Delete project | `DELETE /projects/:id` |
| Dashboard summary | `GET /projects/:id/analytics/summary` |
| Dashboard chart | `GET /projects/:id/analytics/timeseries` |
| Endpoint performance | `GET /projects/:id/analytics/endpoints` |
| Logs | `GET /projects/:id/logs` |
| Send test event | `POST /ingest` |

---

# 12. Security Notes

Never commit:

- `.env`
- MongoDB connection strings
- JWT secrets
- real project API keys
- real JWT tokens

The production API credentials are supplied through environment variables or authenticated responses, not hard-coded in the frontend source.

---

# 13. Production Endpoints

Production API base:

```text
https://pulseapi-9ect.onrender.com/api
```

Health:

```text
https://pulseapi-9ect.onrender.com/api/health
```

Register:

```text
https://pulseapi-9ect.onrender.com/api/auth/register
```

Login:

```text
https://pulseapi-9ect.onrender.com/api/auth/login
```

Projects:

```text
https://pulseapi-9ect.onrender.com/api/projects
```

Ingestion:

```text
https://pulseapi-9ect.onrender.com/api/ingest
```

---

# 14. Final Endpoint Reference

| Method | Endpoint | Authentication |
|---|---|---|
| `GET` | `/api/health` | None |
| `POST` | `/api/auth/register` | None |
| `POST` | `/api/auth/login` | None |
| `GET` | `/api/auth/me` | JWT |
| `POST` | `/api/projects` | JWT |
| `GET` | `/api/projects` | JWT |
| `GET` | `/api/projects/:id` | JWT |
| `PATCH` | `/api/projects/:id` | JWT |
| `DELETE` | `/api/projects/:id` | JWT |
| `POST` | `/api/ingest` | Project API key |
| `GET` | `/api/projects/:id/analytics/summary` | JWT |
| `GET` | `/api/projects/:id/analytics/timeseries` | JWT |
| `GET` | `/api/projects/:id/analytics/endpoints` | JWT |
| `GET` | `/api/projects/:id/logs` | JWT |
