# ServiceHub Project

## Setup Instructions

### 1. Database Setup
```bash
# Create the database first
psql -U postgres -c "CREATE DATABASE servicehub;"

# Run schema
psql -U postgres -d servicehub -f backend/db/schema.sql
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

Server runs on: http://localhost:5000

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

App runs on: http://localhost:5173

---

## Default Admin Account
- **Email:** admin@servicehub.com
- **Password:** admin123

## API Endpoints

| Module | Endpoint |
|--------|----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Services | `GET /api/services`, `POST /api/services`, `GET /api/services/:id` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings/provider` |
| Reviews | `POST /api/reviews`, `GET /api/reviews/service/:id` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users`, etc. |

## Tech Stack
- **Backend:** Node.js, Express.js, PostgreSQL (pg), JWT, Multer
- **Frontend:** React 19, Vite, React Router v6, Axios, React Hot Toast
