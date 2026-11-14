# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application built with React, Node.js, Express, and PostgreSQL. Patients can securely record and monitor their glucose readings, while doctors can access reports for their assigned patients.

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcryptjs

### Testing & Deployment
- Jest
- Supertest
- Docker
- Docker Compose

## Features

### Patient Features
- User registration and login
- Secure password hashing
- JWT-based authentication
- Add, view, edit, and delete glucose readings
- Track readings by date and time slot
- Validation for glucose values (40–600 mg/dL)
- Maximum four readings per day
- Prevent duplicate readings for the same date and slot
- Prevent future-dated readings
- Daily glucose report
- Month-to-date report
- Previous month's report
- Highest, lowest, average, and total readings
- Reading history with pagination
- User-specific reading access

### Doctor Features
- Doctor login and role-based access
- Assign patients using their email address
- View assigned patients
- Generate daily patient reports
- Generate month-to-date reports
- Generate previous-month reports
- View glucose statistics and readings
- Restrict report access to assigned patients
- Read-only access to patient records

## Project Structure

```text
sweety-glucose-tracker/
├── client/
│   └── src/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── tests/
│   ├── app.js
│   └── server.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/sreyamanoharan/sweety-glucose-tracker.git
cd sweety-glucose-tracker
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` and configure:

```env
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET=your_secret_key
```

### 3. Database setup

Make sure PostgreSQL is running and the database exists.

Run migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed demo patient data:

```bash
npm run seed
```

### 4. Create a doctor account

Configure the following environment variables in `server/.env`:

```env
DOCTOR_NAME="Dr. Sweety"
DOCTOR_EMAIL="doctor@example.com"
DOCTOR_PASSWORD="your_doctor_password"
```

Run:

```bash
node prisma/createDoctor.js
```

### 5. Start the backend

```bash
npm run dev
```

Backend runs at:

http://localhost:5000

### 6. Frontend setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file using `client/.env.example`.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite.

## Docker Setup

The project includes Docker Compose configuration for PostgreSQL and the backend API.

From the project root, run:

```bash
docker compose up -d --build
```

Check running containers:

```bash
docker compose ps
```

Stop containers:

```bash
docker compose down
```

The backend API runs on port `5000`, and PostgreSQL is exposed on port `5433`.

The React frontend can be started separately using the frontend setup instructions above.

## Demo Login

**Patient Account**

Email: `demo@sweety.com`

Password: `Demo@12345`

A doctor account can be created using the doctor setup instructions.

## API Routes

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login |

### Patient Reading Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings` | Get readings |
| POST | `/api/readings` | Add reading |
| PUT | `/api/readings/:id` | Update reading |
| DELETE | `/api/readings/:id` | Delete reading |

### Patient Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily` | Daily report |
| GET | `/api/reports/month-to-date` | Month-to-date report |
| GET | `/api/reports/monthly` | Previous month's report |

### Doctor Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctor/patients` | Get assigned patients |
| POST | `/api/doctor/patients` | Assign a patient |

### Doctor Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctor/patients/:patientId/reports/daily` | Patient daily report |
| GET | `/api/doctor/patients/:patientId/reports/month-to-date` | Patient month-to-date report |
| GET | `/api/doctor/patients/:patientId/reports/monthly` | Patient previous-month report |

Doctor report endpoints require a valid doctor token and an existing patient assignment. Report endpoints accept a `date` query parameter in `YYYY-MM-DD` format.

## Running Backend Tests

Navigate to the server directory:

```bash
cd server
```

Run:

```bash
npm test
```

The backend test suite covers authentication, glucose readings, reports, doctor APIs, and application endpoints.

**Current test results: 30 tests passed across 5 test suites.**

## Author

Developed as a full-stack development assignment.