# NEXUS API Reference

## Base URLs

- **Production:** `https://nexus-three-phi.vercel.app/`
- **Development:** `http://localhost:5001`

## Authentication

All protected endpoints require: `Authorization: Bearer <jwt-token>`

## Endpoints Overview

| Method                     | Endpoint                                               | Auth | Description                 |
| -------------------------- | ------------------------------------------------------ | ---- | --------------------------- |
| **Authentication**         |
| POST                       | `/api/users/signup`                                    | ❌   | Register new user           |
| POST                       | `/api/users/login`                                     | ❌   | Login user                  |
| **User Management**        |
| GET                        | `/api/users`                                           | ✅   | Get all users               |
| GET                        | `/api/users/:id`                                       | ✅   | Get user by ID              |
| PATCH                      | `/api/users/profilesetup`                              | ✅   | Update user profile         |
| GET                        | `/api/users/notifications`                             | ✅   | Get user notifications      |
| **Project Discovery**      |
| GET                        | `/api/projects/fetch`                                  | ✅   | Get available projects      |
| GET                        | `/api/projects/discover`                               | ✅   | Alias for fetch             |
| GET                        | `/api/projects`                                        | ✅   | Get all projects            |
| GET                        | `/api/projects/:id`                                    | ✅   | Get project by ID           |
| **Project Management**     |
| POST                       | `/api/projects`                                        | ✅   | Create new project          |
| PATCH                      | `/api/projects/:id`                                    | ✅   | Update project              |
| DELETE                     | `/api/projects/:id`                                    | ✅   | Delete project              |
| **Project Actions**        |
| POST                       | `/api/projects/:id/apply`                              | ✅   | Apply to project            |
| POST                       | `/api/projects/:id/skip`                               | ✅   | Skip project                |
| POST                       | `/api/projects/:id/save`                               | ✅   | Save project                |
| **User Projects**          |
| GET                        | `/api/projects/my-projects`                            | ✅   | Get user's created projects |
| GET                        | `/api/projects/my-applications`                        | ✅   | Get user's applications     |
| **Application Management** |
| GET                        | `/api/projects/:id/applications`                       | ✅   | Get project applications    |
| PATCH                      | `/api/projects/:projectId/applications/:applicationId` | ✅   | Update application status   |

## Quick Examples

### Authentication

```bash
# Register
curl -X POST /api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","passwordConfirm":"password123"}'

# Login
curl -X POST /api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Projects

```bash
# Get available projects
curl -X GET /api/projects/fetch \
  -H "Authorization: Bearer <token>"

# Create project
curl -X POST /api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Project","location":"Remote","description":"Description","skillsRequired":["React"],"maxMembers":3,"category":"Software","projectType":"Professional"}'

# Apply to project
curl -X POST /api/projects/<project-id>/apply \
  -H "Authorization: Bearer <token>"
```

## Response Format

### Success Response

```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description"
}
```

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### User

```json
{
  "_id": "ObjectId",
  "email": "String (required, unique)",
  "password": "String (hashed)",
  "profilePicture": "String",
  "userName": "String",
  "dateOfBirth": "Date",
  "school": "String",
  "fieldOfStudy": "String",
  "bio": "String (max 500 chars)",
  "skippedProjects": ["ObjectId"],
  "notifications": [...]
}
```

### Project

```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "location": "String (required)",
  "description": "String (required)",
  "skillsRequired": ["String (required)"],
  "creator": "ObjectId (ref: User)",
  "members": ["ObjectId (ref: User)"],
  "maxMembers": "Number (required)",
  "category": "String (enum)",
  "projectType": "String (enum)",
  "applications": [...],
  "status": "String (enum: open, closed)"
}
```

## Categories & Types

### Project Categories

- Software
- Design
- Research
- Business
- Competition

### Project Types

- Academic
- Professional
- Hobby
- Startup
- Hackathon

### Application Status

- pending
- accepted
- rejected

## Query Parameters

### Pagination

- `page` - Page number (default: 1)
- `limit` - Items per page (default varies by endpoint)

### Filtering

- `category` - Filter by project category
- `projectType` - Filter by project type
- `status` - Filter by project status

## Frontend Integration

```javascript
import { API_ENDPOINTS, apiCall } from './config/api';

// Example usage
const login = async (email, password) => {
  return await apiCall(API_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

const fetchProjects = async () => {
  return await apiCall(API_ENDPOINTS.projects + '/fetch');
};
```
