# 🛠️ ServiceHub — Local Services Marketplace

> A full-stack web marketplace connecting **customers** with **local service providers**, built as a Final Year Project at Lithan Educlaas.

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Project Architecture](#-project-architecture)
5. [Database Schema](#-database-schema)
6. [How It Works](#-how-it-works)
7. [API Reference](#-api-reference)
8. [Getting Started](#-getting-started)
9. [Environment Variables](#-environment-variables)
10. [User Roles](#-user-roles)
11. [Default Admin Account](#-default-admin-account)
12. [Utility Scripts](#-utility-scripts)

---

## 🌐 Project Overview

**ServiceHub** is a full-stack marketplace platform that allows customers to discover, book, and review local services (e.g., plumbing, tutoring, cleaning, design). Service providers can list their offerings, manage bookings, and build their reputation through customer reviews. Administrators have a dedicated dashboard to oversee all platform activity.

The platform is built with a **dark glassmorphism** UI design and is fully responsive.

---

## ✨ Key Features

### 👤 Authentication & Authorisation
- JWT-based stateless authentication
- Role-based access control — `customer`, `provider`, `admin`
- Protected routes on both frontend and backend
- Secure bcrypt password hashing

### 🛍️ Service Discovery
- Browse all active services on a public catalogue page
- Search and filter by **category** and **location**
- Detailed service pages with provider info, rating summary, and reviews
- Service image uploads (stored locally via Multer)

### 📅 Booking System
- Customers can book any service with a preferred date and optional notes
- Providers can **confirm**, **complete**, or **cancel** bookings
- Full booking history for both customers and providers

### ⭐ Reviews & Ratings
- Customers can leave a rating (1–5 stars) and a comment after a booking
- Average rating displayed on each service card and detail page
- One review per customer per service (enforced at the database level)

### 🧑‍💼 Role Dashboards
| Role | Dashboard Capabilities |
|------|------------------------|
| **Customer** | View & manage bookings, leave reviews |
| **Provider** | Create/edit/delete services, manage bookings, view earnings |
| **Admin** | User management, service moderation, platform-wide statistics |

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|-------|------------|
| Runtime | Node.js (v18+) |
| Framework | Express.js v4 |
| Database | PostgreSQL (via `pg`) |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | bcrypt |
| File Uploads | Multer (local storage, `/uploads`) |
| Validation | express-validator |
| Environment | dotenv |
| Dev Server | nodemon |

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Styling | Vanilla CSS (custom dark glassmorphism design system) |

### Database
- **PostgreSQL** — relational database with 4 core tables and performance indexes

---

## 📁 Project Architecture

```
service-hub-projects/
├── package.json            # Root monorepo scripts
├── setup-db.js             # One-time database initialisation script
├── reset-admin.js          # Utility to reset the admin password
│
├── backend/
│   ├── server.js           # Express app entry point
│   ├── .env                # Environment variables (not committed)
│   ├── config/
│   │   └── db.js           # PostgreSQL connection pool
│   ├── db/
│   │   └── schema.sql      # Full database schema + seed data
│   ├── middleware/
│   │   ├── auth.js         # JWT verification middleware
│   │   └── upload.js       # Multer file upload configuration
│   ├── controllers/        # Business logic per domain
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── routes/             # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   └── uploads/            # Uploaded service images (gitignored)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Root component + router setup
        ├── index.css           # Global design system (tokens, utilities)
        ├── api/
        │   └── axios.js        # Pre-configured Axios instance
        ├── context/
        │   └── AuthContext.jsx # Global auth state (user, token, login/logout)
        ├── components/
        │   ├── Navbar.jsx      # Responsive navigation with role-aware links
        │   ├── ProtectedRoute.jsx  # Role-based route guard
        │   ├── ServiceCard.jsx # Reusable service listing card
        │   ├── BookingModal.jsx # Date & notes booking modal
        │   ├── ReviewForm.jsx  # Star rating + comment form
        │   ├── StarRating.jsx  # Visual star component
        │   └── StatusBadge.jsx # Coloured booking status pill
        └── pages/
            ├── Home.jsx            # Landing page with hero & categories
            ├── Services.jsx        # Service catalogue with search/filter
            ├── ServiceDetail.jsx   # Individual service + booking + reviews
            ├── Login.jsx           # Login form
            ├── Register.jsx        # Registration form with role selection
            ├── CustomerDashboard.jsx   # Customer bookings & reviews
            ├── ProviderDashboard.jsx   # Provider services & booking mgmt
            └── AdminDashboard.jsx      # Admin users, services & stats panel
```

---

## 🗄️ Database Schema

```
users
  id, name, email, password_hash, role, phone, location,
  avatar_url, bio, is_verified, is_active, created_at, updated_at

services
  id, provider_id → users, title, description, category,
  location, price, image_url, is_active, created_at, updated_at

bookings
  id, customer_id → users, service_id → services,
  booking_date, notes, status (pending|confirmed|completed|cancelled),
  created_at, updated_at

reviews
  id, customer_id → users, service_id → services,
  booking_id → bookings, rating (1–5), comment, created_at
  UNIQUE(customer_id, service_id)
```

**Indexes** are defined on frequently queried columns: `services.category`, `services.location`, `services.provider_id`, `bookings.customer_id`, `bookings.service_id`, `bookings.status`, `reviews.service_id`, `reviews.customer_id`.

---

## ⚙️ How It Works

### Authentication Flow
1. User registers with name, email, password, and a role (`customer` or `provider`).
2. Password is hashed with bcrypt before storage.
3. On login, the server validates credentials and returns a **signed JWT**.
4. The frontend stores the token in `localStorage` and attaches it as a `Bearer` token on every API request via the Axios instance.
5. Protected backend routes verify the token via the `auth` middleware. Role-specific endpoints also check `req.user.role`.

### Service Listing Flow
1. A **provider** logs in and creates a service from their dashboard (title, description, category, location, price, and an optional image).
2. The image is uploaded via `multipart/form-data` and saved to `backend/uploads/`.
3. The service appears immediately on the public **Services** catalogue.

### Booking Flow
1. A **customer** browses services, opens a service detail page, and clicks **Book Now**.
2. A modal collects the preferred date and optional notes.
3. The booking is created with `status = 'pending'`.
4. The **provider** sees the booking in their dashboard and can mark it `confirmed`, `completed`, or `cancelled`.

### Review Flow
1. After a booking, the customer can leave a **1–5 star rating** and an optional comment.
2. Only one review is allowed per customer per service (database-level constraint).
3. The average rating is aggregated and displayed on the service card and detail page.

### Admin Flow
The admin dashboard provides:
- Platform-wide **statistics** (total users, services, bookings, revenue)
- **User management** — view all users, toggle active/inactive status
- **Service moderation** — view and toggle service visibility

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Private | Get current user profile |
| PUT | `/profile` | Private | Update profile details |

### Services — `/api/services`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | List all active services (query: `category`, `location`) |
| GET | `/:id` | Public | Get service details + avg rating |
| POST | `/` | Provider | Create a new service (multipart) |
| PUT | `/:id` | Provider | Update own service |
| DELETE | `/:id` | Provider | Delete own service |
| GET | `/my/services` | Provider | List provider's own services |

### Bookings — `/api/bookings`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | Customer | Create a booking |
| GET | `/my` | Customer | Get customer's bookings |
| GET | `/provider` | Provider | Get bookings for provider's services |
| PUT | `/:id/status` | Provider | Update booking status |

### Reviews — `/api/reviews`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | Customer | Submit a review |
| GET | `/service/:serviceId` | Public | Get reviews for a service |

### Admin — `/api/admin`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/stats` | Admin | Platform statistics |
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id/toggle` | Admin | Toggle user active status |
| GET | `/services` | Admin | List all services |
| PUT | `/services/:id/toggle` | Admin | Toggle service visibility |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher

### 1. Clone the repository
```bash
git clone https://github.com/soeyehtut2002/ServiceHub-v0.1.git
cd service-hub-projects
```

### 2. Install dependencies
```bash
# Root utilities
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment variables
Create a `.env` file inside the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/servicehub
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Set up the database
```bash
# From the project root
npm run setup-db
```
This runs `setup-db.js` which executes `schema.sql` against your PostgreSQL instance, creating all tables and seeding the default admin account.

### 5. Run the application
Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:5000)
npm run backend

# Terminal 2 — Frontend (http://localhost:5173)
npm run frontend
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `PORT` | Port the backend runs on | `5000` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

---

## 👥 User Roles

| Role | Registration | Capabilities |
|------|-------------|--------------|
| `customer` | Self-register | Browse services, make bookings, leave reviews |
| `provider` | Self-register | List services, manage bookings, view earnings |
| `admin` | Seeded / script | Full platform management, user & service moderation |

---

## 🔑 Default Admin Account

A default admin account is seeded during database setup:

| Field | Value |
|-------|-------|
| Email | `admin@servicehub.com` |
| Password | `admin123` |

> ⚠️ **Change the admin password after first login in a production environment.**

---

## 🛠️ Utility Scripts

### `setup-db.js`
Initialises the PostgreSQL database by running the full `schema.sql` file. Run once before first use.
```bash
npm run setup-db
```

### `reset-admin.js`
Resets the admin account password to `admin123` and ensures the admin user exists. Useful if admin credentials are lost.
```bash
node reset-admin.js
```

---

## 📝 License

This project was developed as a Final Year Project at **Lithan Educlaas**. All rights reserved.
