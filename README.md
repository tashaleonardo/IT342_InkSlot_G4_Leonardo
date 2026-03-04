# InkSlot — Tattoo Shop Booking System

> A full-stack tattoo shop booking platform that allows guests to browse artist profiles and book appointments without mandatory registration, while providing artists and admins with secure dashboards to manage bookings, profiles, and schedules.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Spring Boot | 4.0.3 |
| Backend Language | Java | 21 (LTS) |
| Security | Spring Security + JJWT | 7.1.0 |
| ORM | Spring Data JPA / Hibernate | 6.5.x |
| Database | PostgreSQL (Supabase) | 17 |
| Web Frontend | React + Vite | 19.2.0 |
| Web Styling | CSS (custom) | — |
| HTTP Client | Axios | 1.7.x |
| Mobile Language | Kotlin | 2.3.0 |
| Mobile UI | XML-Based Layouts (Android Views) | API Level 34 |
| Mobile HTTP | Retrofit 2 + OkHttp | 2.11.x |
| Build (Backend) | Maven | 3.9.9 |
| Build (Web) | Vite + npm | 6.0.x |
| Build (Mobile) | Gradle | 9.0.x |

---

## Project Structure

```
IT342_InkSlot_G4_Leonardo/
├── backend/        # Spring Boot Maven project (Java 21)
├── web/            # React + Vite web application
├── mobile/         # Android Studio Kotlin project
├── docs/           # SDD, ERD diagrams, wireframes
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Java 21+
- Node.js 18+ and npm
- Maven 3.9+
- PostgreSQL database (or Supabase account)
- Android Studio (for mobile)

---

### Backend (Spring Boot)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Configure your database and JWT secret in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://<your-db-host>:5432/postgres
   spring.datasource.username=<your-username>
   spring.datasource.password=<your-password>
   jwt.secret=<your-jwt-secret>
   ```

3. Build and run:
   ```bash
   mvn clean install -DskipTests
   mvn spring-boot:run
   ```

4. Backend runs on `http://localhost:8080`

---

### Web Frontend (React)

1. Navigate to the web folder:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API base URL in `src/services/api.js` to point to your backend.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Frontend runs on `http://localhost:5173`

---

### Mobile (Android)

1. Open the `mobile/` folder in Android Studio.
2. Update the base URL in the Retrofit configuration to point to your backend.
3. Run on an emulator or physical device with API Level 34.

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new artist account | Public |
| POST | `/auth/login` | Login and receive JWT tokens | Public |
| GET | `/auth/me` | Get authenticated user profile | Bearer JWT |
| POST | `/auth/logout` | Invalidate refresh token | Bearer JWT |
| GET | `/auth/google` | Initiate Google OAuth 2.0 flow | Public |
| GET | `/auth/google/callback` | Handle OAuth callback; issue JWT | OAuth state |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/admin/artists` | Create a new artist account | Bearer JWT (ADMIN) |
| GET | `/admin/artists` | Get all artists | Bearer JWT (ADMIN) |
| PATCH | `/admin/artists/:id/status` | Toggle artist active status | Bearer JWT (ADMIN) |
| DELETE | `/admin/artists/:id` | Delete an artist account | Bearer JWT (ADMIN) |

### Artists

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/artists` | List all active artists | Public |
| GET | `/artists/:id` | Get artist profile | Public |
| PUT | `/artists/:id/profile` | Update artist profile | Bearer JWT (ARTIST) |
| POST | `/artists/:id/portfolio` | Add portfolio image | Bearer JWT (ARTIST) |
| DELETE | `/artists/:id/portfolio/:imageId` | Delete portfolio image | Bearer JWT (ARTIST) |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/bookings` | Create a guest booking | Public |
| GET | `/bookings/status/:referenceNumber` | Public booking status lookup | Public |
| GET | `/artist/bookings` | Get artist's bookings | Bearer JWT (ARTIST) |
| PATCH | `/artist/bookings/:id/status` | Update booking status | Bearer JWT (ARTIST) |

---

## Roles

| Role | Access |
|------|--------|
| `ARTIST` | Artist dashboard, profile, portfolio, bookings |
| `ADMIN` | Admin dashboard, manage all artists |
| Guest | Browse artists, create bookings (no account needed) |

---

## Author

**Leonardo, Natasha Kate Alavanza**

IT342 — System Integration and Architecture
Cebu Institute of Technology – University
