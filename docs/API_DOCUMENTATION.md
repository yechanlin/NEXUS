# NEXUS API Documentation

## Overview

The NEXUS API is a RESTful service that provides endpoints for user authentication, project management, and collaboration features. The API uses JWT tokens for authentication and follows REST conventions.

**Base URL:** `https://nexus-three-phi.vercel.app/` (Production)  
**Development URL:** `http://localhost:5001` (Local Development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### 1. User Registration

**POST** `/api/users/signup`

Creates a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Response (201):**

```json
{
  "status": "success",
  "token": "jwt-token-here",
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@example.com",
      "profilePicture": "https://via.placeholder.com/120",
      "userName": null,
      "dateOfBirth": null,
      "school": null,
      "fieldOfStudy": null,
      "bio": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `400` - Missing required fields or passwords don't match
- `400` - User already exists

#### 2. User Login

**POST** `/api/users/login`

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "token": "jwt-token-here",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Incorrect email or password

### User Management

#### 3. Get All Users

**GET** `/api/users`

_Requires Authentication_

Returns a list of all users.

**Response (200):**

```json
{
  "status": "success",
  "results": 10,
  "data": {
    "users": [
      {
        "_id": "user-id",
        "email": "user@example.com",
        "userName": "John Doe",
        "profilePicture": "https://via.placeholder.com/120",
        "school": "University of Example",
        "fieldOfStudy": "Computer Science",
        "bio": "Software developer with 5 years of experience"
      }
    ]
  }
}
```

#### 4. Get User by ID

**GET** `/api/users/:id`

_Requires Authentication_

Returns a specific user by ID.

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@example.com",
      "userName": "John Doe",
      "profilePicture": "https://via.placeholder.com/120",
      "school": "University of Example",
      "fieldOfStudy": "Computer Science",
      "bio": "Software developer with 5 years of experience"
    }
  }
}
```

#### 5. Update User Profile

**PATCH** `/api/users/profilesetup`

_Requires Authentication_

Updates the current user's profile information.

**Request Body:**

```json
{
  "userId": "user-id",
  "profileImage": "https://example.com/image.jpg",
  "userName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "school": "University of Example",
  "fieldOfStudy": "Computer Science",
  "bio": "Software developer with 5 years of experience"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@example.com",
      "userName": "John Doe",
      "profilePicture": "https://example.com/image.jpg",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "school": "University of Example",
      "fieldOfStudy": "Computer Science",
      "bio": "Software developer with 5 years of experience"
    }
  }
}
```

#### 6. Get User Notifications

**GET** `/api/users/notifications`

_Requires Authentication_

Returns notifications for the authenticated user.

**Response (200):**

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "notifications": [
      {
        "_id": "notification-id",
        "type": "application_status",
        "message": "Your application for 'Project Title' was accepted.",
        "relatedProject": {
          "_id": "project-id",
          "title": "Project Title"
        },
        "read": false,
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Project Management

#### 7. Fetch Projects (Discovery)

**GET** `/api/projects/fetch`

_Requires Authentication_

Returns projects available for the authenticated user (excluding their own projects, skipped projects, and already applied projects).

**Response (200):**

```json
{
  "status": "success",
  "results": 5,
  "data": {
    "projects": [
      {
        "_id": "project-id",
        "title": "Web Application Development",
        "location": "Remote",
        "description": "Building a modern web application using React and Node.js",
        "skillsRequired": ["React", "Node.js", "MongoDB"],
        "creator": {
          "_id": "creator-id",
          "userName": "John Doe",
          "profilePicture": "https://via.placeholder.com/120"
        },
        "maxMembers": 3,
        "category": "Software",
        "projectType": "Professional",
        "status": "open",
        "applications": [],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 8. Get All Projects

**GET** `/api/projects`

_Requires Authentication_

Returns all projects with optional filtering.

**Query Parameters:**

- `category` (optional) - Filter by category
- `projectType` (optional) - Filter by project type
- `status` (optional) - Filter by status

**Response (200):**

```json
{
  "status": "success",
  "results": 10,
  "data": {
    "projects": [
      {
        "_id": "project-id",
        "title": "Web Application Development",
        "location": "Remote",
        "description": "Building a modern web application",
        "skillsRequired": ["React", "Node.js"],
        "creator": {
          "_id": "creator-id",
          "userName": "John Doe",
          "profilePicture": "https://via.placeholder.com/120"
        },
        "maxMembers": 3,
        "category": "Software",
        "projectType": "Professional",
        "status": "open",
        "applications": [],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 9. Get Project by ID

**GET** `/api/projects/:id`

_Requires Authentication_

Returns a specific project by ID.

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "project": {
      "_id": "project-id",
      "title": "Web Application Development",
      "location": "Remote",
      "description": "Building a modern web application",
      "skillsRequired": ["React", "Node.js"],
      "creator": {
        "_id": "creator-id",
        "userName": "John Doe",
        "profilePicture": "https://via.placeholder.com/120"
      },
      "maxMembers": 3,
      "category": "Software",
      "projectType": "Professional",
      "status": "open",
      "applications": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 10. Create Project

**POST** `/api/projects`

_Requires Authentication_

Creates a new project.

**Request Body:**

```json
{
  "title": "Web Application Development",
  "location": "Remote",
  "description": "Building a modern web application using React and Node.js",
  "skillsRequired": ["React", "Node.js", "MongoDB"],
  "maxMembers": 3,
  "category": "Software",
  "projectType": "Professional"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "project": {
      "_id": "project-id",
      "title": "Web Application Development",
      "location": "Remote",
      "description": "Building a modern web application using React and Node.js",
      "skillsRequired": ["React", "Node.js", "MongoDB"],
      "creator": {
        "_id": "creator-id",
        "userName": "John Doe",
        "profilePicture": "https://via.placeholder.com/120"
      },
      "maxMembers": 3,
      "category": "Software",
      "projectType": "Professional",
      "status": "open",
      "applications": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 11. Update Project

**PATCH** `/api/projects/:id`

_Requires Authentication_

Updates a project (only by the creator).

**Request Body:**

```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "maxMembers": 4
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "project": {
      "_id": "project-id",
      "title": "Updated Project Title",
      "description": "Updated description",
      "maxMembers": 4
    }
  }
}
```

#### 12. Delete Project

**DELETE** `/api/projects/:id`

_Requires Authentication_

Deletes a project (only by the creator).

**Response (204):** No content

### Project Applications

#### 13. Apply to Project

**POST** `/api/projects/:id/apply`

_Requires Authentication_

Applies to a project.

**Response (200):**

```json
{
  "status": "success",
  "message": "Application submitted successfully"
}
```

**Error Responses:**

- `400` - Already applied to this project
- `404` - Project not found

#### 14. Skip Project

**POST** `/api/projects/:id/skip`

_Requires Authentication_

Marks a project as skipped for the user.

**Response (200):**

```json
{
  "status": "success",
  "message": "Project skipped"
}
```

#### 15. Save Project

**POST** `/api/projects/:id/save`

_Requires Authentication_

Saves a project for later reference.

**Response (200):**

```json
{
  "status": "success",
  "message": "Project saved"
}
```

### User Projects

#### 16. Get My Projects

**GET** `/api/projects/my-projects`

_Requires Authentication_

Returns projects created by the authenticated user.

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 5)

**Response (200):**

```json
{
  "status": "success",
  "results": 3,
  "total": 10,
  "page": 1,
  "totalPages": 2,
  "data": {
    "projects": [
      {
        "_id": "project-id",
        "title": "My Project",
        "location": "Remote",
        "description": "Project description",
        "skillsRequired": ["React", "Node.js"],
        "creator": {
          "_id": "creator-id",
          "userName": "John Doe",
          "profilePicture": "https://via.placeholder.com/120"
        },
        "maxMembers": 3,
        "category": "Software",
        "projectType": "Professional",
        "status": "open",
        "applications": [
          {
            "_id": "application-id",
            "user": {
              "_id": "applicant-id",
              "userName": "Jane Smith",
              "profilePicture": "https://via.placeholder.com/120"
            },
            "status": "pending",
            "appliedAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 17. Get My Applications

**GET** `/api/projects/my-applications`

_Requires Authentication_

Returns applications submitted by the authenticated user.

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response (200):**

```json
{
  "status": "success",
  "results": 2,
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "data": {
    "applications": [
      {
        "project": {
          "_id": "project-id",
          "title": "Web Application Development",
          "description": "Building a modern web application",
          "category": "Software",
          "projectType": "Professional",
          "creator": {
            "_id": "creator-id",
            "userName": "John Doe",
            "profilePicture": "https://via.placeholder.com/120"
          }
        },
        "application": {
          "_id": "application-id",
          "status": "pending",
          "appliedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ]
  }
}
```

### Application Management

#### 18. Get Project Applications

**GET** `/api/projects/:id/applications`

_Requires Authentication_

Returns applications for a specific project (only accessible by the project creator).

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "project": {
      "_id": "project-id",
      "title": "Web Application Development",
      "applications": [
        {
          "_id": "application-id",
          "user": {
            "_id": "applicant-id",
            "userName": "Jane Smith",
            "email": "jane@example.com",
            "profilePicture": "https://via.placeholder.com/120"
          },
          "status": "pending",
          "appliedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Error Responses:**

- `403` - Not authorized to view applications for this project
- `404` - Project not found

#### 19. Update Application Status

**PATCH** `/api/projects/:projectId/applications/:applicationId`

_Requires Authentication_

Updates the status of an application (accept/reject).

**Request Body:**

```json
{
  "status": "accepted"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Application accepted successfully",
  "data": {
    "application": {
      "_id": "application-id",
      "user": "applicant-id",
      "status": "accepted",
      "appliedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `400` - Invalid status (must be 'accepted' or 'rejected')
- `403` - Not authorized to update applications for this project
- `404` - Project or application not found

## Data Models

### User Model

```json
{
  "_id": "ObjectId",
  "email": "String (required, unique)",
  "password": "String (required, hashed)",
  "profilePicture": "String (default: placeholder)",
  "userName": "String",
  "dateOfBirth": "Date",
  "school": "String",
  "fieldOfStudy": "String",
  "bio": "String (max 500 characters)",
  "createdAt": "Date",
  "skippedProjects": ["ObjectId (ref: Project)"],
  "notifications": [
    {
      "type": "String",
      "message": "String",
      "relatedProject": "ObjectId (ref: Project)",
      "read": "Boolean",
      "timestamp": "Date"
    }
  ]
}
```

### Project Model

```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "location": "String (required)",
  "description": "String (required)",
  "skillsRequired": ["String (required)"],
  "creator": "ObjectId (ref: User, required)",
  "members": ["ObjectId (ref: User)"],
  "maxMembers": "Number (required)",
  "category": "String (enum: Software, Design, Research, Business, Competition)",
  "projectType": "String (enum: Academic, Professional, Hobby, Startup, Hackathon)",
  "applications": [
    {
      "user": "ObjectId (ref: User)",
      "status": "String (enum: pending, accepted, rejected)",
      "appliedAt": "Date"
    }
  ],
  "status": "String (enum: open, closed)",
  "createdAt": "Date"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are applied per IP address and per endpoint.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for web applications.

## Environment Variables

Required environment variables for the backend:

- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5001)

## SDK/Client Libraries

### JavaScript/React Example

```javascript
import { API_ENDPOINTS, apiCall } from './config/api';

// Login
const login = async (email, password) => {
  return await apiCall(API_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Fetch projects
const fetchProjects = async () => {
  return await apiCall(API_ENDPOINTS.projects + '/fetch');
};

// Apply to project
const applyToProject = async (projectId) => {
  return await apiCall(API_ENDPOINTS.projects + `/${projectId}/apply`, {
    method: 'POST',
  });
};
```

## Testing

You can test the API endpoints using tools like:

- Postman
- cURL
- Insomnia
- Thunder Client (VS Code extension)

### Example cURL Commands

```bash
# Login
curl -X POST https://nexus-three-phi.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get projects (with token)
curl -X GET https://nexus-three-phi.vercel.app/api/projects/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create project
curl -X POST https://nexus-three-phi.vercel.app/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Project","location":"Remote","description":"Description","skillsRequired":["React"],"maxMembers":3,"category":"Software","projectType":"Professional"}'
```

## Support

For API support or questions, please contact the development team or create an issue in the project repository.
