# Employee Onboarding Portal

A full-stack employee onboarding management system built with React, Node.js, Express, and PostgreSQL.

## Architecture

```
employee-onboarding-portal/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database configuration
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, RBAC, validation, upload, error handling
│   ├── models/               # Sequelize ORM models
│   ├── routes/               # Express route definitions
│   ├── seeds/                # Database seed script
│   ├── utils/                # Encryption, file validation helpers
│   ├── uploads/              # Uploaded files (outside public web root)
│   ├── server.js             # Entry point
│   └── schema.sql            # SQL schema reference
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/              # Axios client with interceptors
│   │   ├── components/       # Shared UI components
│   │   ├── context/           # Auth context
│   │   ├── pages/            # Route pages
│   │   └── styles/           # Global CSS
│   └── vite.config.js        # Vite config with API proxy
└── README.md
```

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, React Router 6, Axios |
| Backend  | Node.js, Express 4, JWT, Multer     |
| Database | PostgreSQL, Sequelize ORM           |
| Security | bcryptjs, AES-256-CBC encryption    |

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm

## Setup Instructions

### 1. Clone and install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and a secure JWT_SECRET
```

**Environment Variables:**

| Variable              | Description                     | Default                |
|-----------------------|---------------------------------|------------------------|
| PORT                  | API server port                 | 5000                   |
| DB_HOST               | Database host                   | localhost              |
| DB_PORT               | Database port                   | 5432                   |
| DB_USER               | Database user                   | postgres               |
| DB_PASSWORD           | Database password               | postgres               |
| DB_NAME               | Database name                   | employee_onboarding    |
| JWT_SECRET            | JWT signing secret              | (change in production) |
| JWT_EXPIRES_IN        | Token expiration                | 7d                     |
| UPLOAD_DIR            | File upload directory           | ./uploads              |
| ENCRYPTION_KEY        | AES-256 key for sensitive data  | (32 chars)             |
| FRONTEND_URL          | Base URL for setup invite links | http://localhost:3000 |

### 3. Create database

```bash
psql -U postgres -c "CREATE DATABASE employee_onboarding;"
```

### 4. Seed demo data

```bash
cd backend
npm run seed
```

This creates:
- 1 HR user
- 3 sample employees with complete profiles
- 5 document types (ID, address, education, experience, optional photo)
- 6 checklist items (NDA, IT form, handbook, etc.)
- Sample document records and checklist progress
- A demo setup token for `newhire@example.com` (printed in console)

### 5. Start the application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000

## Demo Credentials

| Role     | Email              | Password   |
|----------|--------------------|------------|
| HR       | hr@company.com     | hr123456   |
| Employee | john@example.com   | emp123456  |
| Employee | jane@example.com   | emp123456  |
| Employee | bob@example.com    | emp123456  |

## Status Flow

```
Profile Incomplete
       ↓  (complete profile)
Profile Complete
       ↓  (upload documents)
Documents Uploaded
       ↓  (submit for verification)
Documents Submitted
       ↓  (HR approves all)
Documents Approved
       ↓  (start checklist)
Checklist In Progress
       ↓  (confirm joining)
Joining Confirmed
```

## API Documentation

### Authentication

#### GET /api/auth/setup/validate?token=...
Validate an HR-issued setup token before registration.

#### POST /api/auth/setup
First-time password setup with HR invitation token (required).

```json
// Request
{ "setup_token": "...", "password": "pass123", "name": "New User", "email": "new@example.com" }
// Response 201
{ "token": "jwt...", "user": { "id": 1, "email": "...", "name": "...", "role": "employee", "is_first_login": false, "onboarding_status": "Profile Incomplete", "has_profile": false } }
```

#### POST /api/auth/login
Login for all users.

```json
// Request
{ "email": "hr@company.com", "password": "hr123456" }
// Response 200
{ "token": "jwt...", "user": { "id": 1, "email": "...", "name": "HR Manager", "role": "hr", "is_first_login": false, "onboarding_status": "Profile Complete", "has_profile": true } }
```

#### GET /api/auth/me
Get current authenticated user.

### Profile

#### GET /api/profile
Get employee profile (masked sensitive fields).

#### PUT /api/profile
Update employee profile. Completing required fields auto-advances status.

```json
// Request
{ "phone": "9876543210", "date_of_birth": "1995-06-15", "address": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001" }
```

### Documents

#### POST /api/documents/upload
Upload a document (multipart/form-data). Profile must be complete first.

| Field          | Type   | Description                  |
|----------------|--------|------------------------------|
| file           | File   | The document file            |
| document_type  | String | Code: id_proof, address_proof, education, experience, photo |

Allowed: `.pdf`, `.jpg`, `.jpeg`, `.png`. Extension + **file-type** magic-byte MIME check. Max size from `document_types.max_size_bytes`.

#### GET /api/documents/types
List document types with mandatory flag and size limits.

#### GET /api/documents/my
Get current user's documents.

#### POST /api/documents/submit
Submit pending documents for HR verification. Changes status to "Documents Submitted".

#### GET /api/download/:id
Download a document file (authenticated). Employees can only download their own.

#### POST /api/joining/confirm
Employee confirms joining date (requires mandatory docs approved + checklist done).

```json
{ "joining_date": "2026-06-15" }
```

### Checklist

#### GET /api/checklist
Get checklist items with user's progress.

```json
// Response 200
{ "checklist": [...], "progress_percent": 42 }
```

#### PATCH /api/checklist/:id
Toggle checklist item completion.

### Admin (HR only)

#### GET /api/admin/onboarding/overview
Overview of all employees and their statuses.

```json
// Response 200
{ "overview": [...], "summary": { "total_employees": 3, "status_counts": { "Profile Complete": 1, ... } } }
```

#### GET /api/admin/documents/:userId
Get an employee's documents and masked profile.

#### PATCH /api/admin/documents/:id/verify
Verify (approve/reject) a document.

```json
// Request
{ "status": "approved" }
// or
{ "status": "rejected", "hr_remark": "Document is blurry" }
```

#### POST /api/admin/employees/invite
Create employee invitation and setup token (HR only).

#### POST /api/admin/joining/confirm/:userId
Confirm joining for an employee with `{ "joining_date": "YYYY-MM-DD" }` (HR only).

## Postman Collection

Import `docs/Employee_Onboarding_Portal.postman_collection.json` into Postman. Set `baseUrl` to `http://localhost:5000` and paste JWT into `token` after login.

## Business Rules

- New employees register only with a valid HR **setup token**
- Profile must be complete (contact, emergency, bank, PAN, education) before document upload
- All **mandatory** document types must be uploaded before submit for verification
- Allowed: PDF, JPG, PNG only (extension + **file-type** content validation)
- Max file size from database per document type (default 5MB)
- Files stored outside public web root, served via authenticated endpoints
- HR remark mandatory for document rejection
- Joining confirmation requires profile complete + all mandatory docs approved + mandatory checklist done + **joining_date**
- Bank account and PAN encrypted at rest (AES-256-CBC)
- Masked in API responses (only last 4 chars shown)
- Approved documents cannot be re-uploaded
- Employees see only their own documents

## Database Tables

| Table               | Purpose                        |
|---------------------|---------------------------------|
| users               | Authentication and role management |
| employee_profiles   | Employee personal details       |
| document_types      | Supported document categories   |
| documents           | Uploaded document records       |
| checklist_items     | Onboarding task definitions     |
| checklist_progress  | Per-employee checklist status   |
| setup_tokens        | HR invitation tokens for first-time setup |

All tables have `created_at`/`updated_at` timestamps, foreign keys, and indexes on frequently queried columns.

## Team Members

| Name | Role | Contribution |
|------|------|--------------|
| _Your Name_ | Full-stack | Backend API, database, frontend UI |
| _Teammate_ | _Role_ | _Contribution_ |

_Update this table with your hackathon team before submission._

## Screenshots

Add PNG screenshots under `docs/screenshots/` (see `docs/screenshots/README.md` for filenames). Example:

![HR Dashboard](docs/screenshots/06-hr-dashboard.png)

## Demo Video

Record a 3–5 minute walkthrough and add `docs/demo.mp4` or an unlisted video URL here:

- **Video:** _Add link or file path after recording_

See `docs/DEMO_VIDEO.md` for the suggested demo script.

## Module 3 Compliance Checklist

- [x] All 7 required screens
- [x] All 10 required REST APIs (+ supporting endpoints)
- [x] Server-side validations (mandatory docs, profile gate, MIME, remarks on reject)
- [x] JWT authentication + HR/employee RBAC
- [x] Files outside web root + authenticated download
- [x] PAN/bank encryption and masking
- [x] PostgreSQL schema + seed data
- [x] Postman collection
- [x] Progress bar (innovation)
- [ ] Screenshots (add to `docs/screenshots/`)
- [ ] Demo video (add per `docs/DEMO_VIDEO.md`)
