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
- Glucose value validation (40–600 mg/dL)
- Maximum four readings per day
- Prevent duplicate readings for the same date and time slot
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
- View patient glucose statistics and readings
- Restrict report access to assigned patients
- Read-only access to patient records

## Project Structure

```text
sweety-glucose-tracker/
├── client/
│   ├── src/
│   └── .env.example
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── seed.js
│   │   └── createDoctor.js
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── app.js
│   └── server.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sreyamanoharan/sweety-glucose-tracker.git

cd sweety-glucose-tracker
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file by copying `.env.example` and configure the required environment variables:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_here

DOCTOR_NAME="Doctor Name"
DOCTOR_EMAIL=doctor@example.com
DOCTOR_PASSWORD=your_doctor_password
```

Replace the placeholder values with your own configuration.

### 3. Database Setup

Make sure PostgreSQL is running and the database exists.

Run database migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

### 4. Seed Demo Patient Data

Run the seed script to create a demo patient account with sample glucose readings:

```bash
npm run seed
```

The seed script can be executed again without creating duplicate demo records.

### 5. Create a Doctor Account

Configure the doctor details in `server/.env`:

```env
DOCTOR_NAME="Dr. Demo"
DOCTOR_EMAIL=doctor@example.com
DOCTOR_PASSWORD=your_doctor_password
```

Run the doctor creation script from the `server` directory:

```bash
node prisma/createDoctor.js
```

This creates a doctor account that can log in and access the doctor dashboard.

### 6. Start the Backend

```bash
npm run dev
```

The backend runs at:

http://localhost:5000

### 7. Frontend Setup

Open another terminal and navigate to the project root:

```bash
cd client
npm install
```

Create a `.env` file using `client/.env.example` and configure the required frontend environment variables.

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

### Patient Account

Email: `demo@sweety.com`

Password: `Demo@12345`

### Doctor Account

Create a doctor account using the instructions in the Doctor Account Setup section.

The doctor email and password are configured through environment variables.

## API Documentation

All protected endpoints require a valid JWT token in the Authorization header:

```text
Authorization: Bearer <your_token>
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a patient |
| POST | `/api/auth/login` | Login |

### Patient Reading Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings` | Get readings |
| POST | `/api/readings` | Add a reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

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

Doctor report endpoints require a valid doctor token and an existing patient assignment.

Report endpoints accept a `date` query parameter in `YYYY-MM-DD` format.

## Running Backend Tests

Navigate to the server directory:

```bash
cd server
```

Run the test suite:

```bash
npm test
```

The backend tests cover:
- Authentication
- Glucose reading management
- Patient reports
- Doctor APIs
- Application endpoints

**Latest test results: 30 tests passed across 5 test suites.**

## Notes

### Assumptions
- Each patient can record a maximum of four glucose readings per day.
- Each reading belongs to one of four predefined time slots.
- Doctors can access reports only for patients assigned to them.
- Doctors have read-only access to patient glucose records.
- Patients can view their own daily and monthly reports.

### Future Improvements
- Add automated frontend tests.
- Improve dashboard analytics and visualizations.
- Add notifications for missing glucose readings.
- Implement data export functionality.

## Author

Developed as a full-stack development assignment.