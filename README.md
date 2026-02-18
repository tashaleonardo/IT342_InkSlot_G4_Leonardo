# Inkslot - Tattoo Appointment System

IT342 Capstone Project - G4 Leonardo

Inkslot is a complete tattoo booking platform that connects clients with tattoo artists. Clients can browse artist portfolios, book appointments, upload design references, process payments, and receive confirmations. Artists/admins manage schedules, appointments, and client files.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Backend      | Spring Boot 3.x, Spring Security, Spring Data JPA |
| Frontend     | React 18 + Vite + React Router      |
| Database     | PostgreSQL                          |
| Auth         | JWT + Google OAuth2                 |
| Payments     | Stripe (Sandbox)                    |
| File Storage | Local storage                       |
| Email        | SMTP (Mailtrap/Gmail)               |
| Real-time    | WebSocket (STOMP)                   |

## Features

Authentication & Security
- JWT Authentication, BCrypt passwords
- User Registration/Login/Logout
- /me endpoint

Role-Based Access Control
- GUEST - Browse artists/services (no login)
- CLIENT - Book appointments, upload files, payments  
- ARTIST - View own schedule, client details
- ADMIN - Manage artists, appointments, dashboard

Core Business Module
- TattooArtist → Appointment (full CRUD)
- Service packages, artist portfolios

System Integrations
- External API (Weather for appointment date)
- Google OAuth Login + custom JWT
- File uploads (design refs, consent forms)
- Stripe Sandbox Payments
- Email notifications (SMTP)
- Real-time updates (WebSocket)

Database (7 tables)
User → Role, Appointment ← TattooArtist, Service
Appointment → Payment, FileAttachment, NotificationLog

## Project Structure

IT342_InkSlot_G4_Leonardo/
├── backend/ # Spring Boot API
├── web/ # React SPA
├── mobile/ # Future Flutter/React Native
├── docs/ # Architecture, ERD, API docs
└── README.md



## Quick Start

Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Stripe account (sandbox)


### Backend

```bash
cd backend
./mvnw spring-boot:run
API: http://localhost:8080

### Frontend

bash
cd web
npm install
npm run dev
App: http://localhost:5173


### Documentation

- Architecture - Layered Architecture
- Database ERD - 7 tables
- API Docs - Swagger/Postman
- Requirements - IT342 checklist


## API Endpoints

| Method   | Endpoint                    | Role    | Description      |
|----------|-----------------------------|---------|------------------|
| POST     | /auth/register              | Public  | Create account   |
| POST     | /auth/login                 | Public  | JWT login        |
| POST     | /auth/google                | Public  | Google OAuth     |
| GET      | /me                         | Auth    | Current user     |
| GET/POST | /appointments               | Client  | List/book        |
| POST     | /appointments/{id}/pay      | Client  | Stripe payment   |
| POST     | /files/upload               | Auth    | Design upload    |
| GET      | /admin/artists              | Admin   | Manage artists   |



## Developer
Leonardo - Full Stack Developer
