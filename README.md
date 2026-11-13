
# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application that allows users to securely record, manage, and monitor their daily blood glucose readings.

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

## Features

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
- User-specific reading access

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
│   └── server.js
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
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

Seed demo data:

```bash
npm run seed
```

### 4. Start the backend

```bash
npm run dev
```

Backend runs at:

http://localhost:5000

### 5. Frontend setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file using `.env.example`.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite.

## Demo Login

Email: `demo@sweety.com`

Password: `Demo@12345`

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/readings | Get readings |
| POST | /api/readings | Add reading |
| PUT | /api/readings/:id | Update reading |
| DELETE | /api/readings/:id | Delete reading |
| GET | /api/reports/daily | Daily report |
| GET | /api/reports/month-to-date | Month-to-date report |
| GET | /api/reports/monthly | Previous month's report |

## Author

Developed as a full-stack development assignment.
