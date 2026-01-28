## HRMS Lite

Lightweight Human Resource Management System (HRMS Lite) for managing employees and daily attendance.  
Built as a production-ready full-stack application with a clean UI, proper validations, and deployment-ready configuration.

### Tech Stack

- **Frontend**: React, Vite, TypeScript, React Query, Axios
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)

### Features

- **Employee Management**
  - Add employees with Employee ID, full name, email, and department
  - Validate required fields and email format
  - Prevent duplicate employee ID and email
  - View list of all employees
  - Delete employee records
- **Attendance Management**
  - Mark attendance for an employee with date and status (Present/Absent)
  - View attendance records, including employee details
  - **Filter by employee and date range** (bonus)
  - **Total present days per employee** (bonus)
  - **Dashboard summary** of total employees and today&apos;s present/absent counts (bonus)
- **Error Handling & UX**
  - Loading, empty, and error states on UI
  - Meaningful HTTP status codes and error messages on backend

---

## Project Structure

```text
HRMS-lite/
  backend/      # Express + Prisma API
  frontend/     # React + Vite SPA
  README.md
```

### Backend (`backend/`)

- `src/app.ts` – Express app, routes wiring, error handling
- `src/index.ts` – Server bootstrap
- `src/prisma.ts` – Prisma client singleton
- `src/routes/employees.ts` – Employee CRUD APIs
- `src/routes/attendance.ts` – Attendance APIs, summaries, dashboard
- `prisma/schema.prisma` – PostgreSQL models (`Employee`, `Attendance`)

### Frontend (`frontend/`)

- `src/App.tsx` – Main layout and sections
- `src/api.ts` – Axios client + shared types
- `src/components/Dashboard.tsx` – Summary cards
- `src/components/EmployeeSection.tsx` – Employee form + table
- `src/components/AttendanceSection.tsx` – Attendance form, filters, records, and summary
- `src/styles.css` – Modern, production-style UI

---

## Backend – Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL instance (local or hosted)

### 1. Configure Environment

In `backend/`, create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
CORS_ORIGIN="*"
PORT=4000
```

Update `CORS_ORIGIN` with your frontend origin (e.g. `http://localhost:5173` or your Vercel URL) for production.

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Initialize Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates the tables for `Employee` and `Attendance`.

### 4. Run Backend

```bash
npm run dev
```

API will be available at `http://localhost:4000/api`.

#### Main Endpoints

- **Employees**
  - `POST /api/employees`
  - `GET /api/employees`
  - `DELETE /api/employees/:id`
- **Attendance**
  - `POST /api/attendance`
  - `GET /api/attendance?employeeId=&from=&to=`
  - `GET /api/attendance/summary/by-employee`
  - `GET /api/attendance/dashboard-summary`

All endpoints return meaningful status codes (400 validation, 404 not found, 409 conflict on duplicates, 500 on unexpected errors).

---

## Frontend – Local Setup

### 1. Configure Environment

In `frontend/`, create `.env`:

```env
VITE_API_BASE_URL="http://localhost:4000"
```

Point this to your deployed backend URL in production.

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Run Frontend

```bash
npm run dev
```

Open `http://localhost:5173` in the browser.

The app will connect to the backend using `VITE_API_BASE_URL`.

---

## Vercel Deployment (Frontend)

You can deploy the **frontend** to Vercel as a separate project:

1. In Vercel, create a new project and select the `frontend/` folder as the root.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add an environment variable:
   - `VITE_API_BASE_URL` = your hosted backend URL (e.g., `https://your-backend.example.com`)
5. Deploy.

The deployed frontend will use the live backend via `VITE_API_BASE_URL`.

---

## Backend Deployment

The backend is a plain Express app and can be deployed to any Node-friendly host (Render, Railway, Fly.io, etc.):

- Use `npm run build` then `npm start` as the start command.
- Provide `DATABASE_URL`, `PORT`, and `CORS_ORIGIN` environment variables.
- Ensure your Postgres instance is reachable from the backend host.

You can also adapt it to serverless platforms, but that is not required for this assignment.

---

## Assumptions & Limitations

- Single admin user; no authentication implemented.
- No pagination; suitable for small/medium datasets.
- Attendance is not prevented from being marked multiple times for the same employee/date (this can be added with an additional unique constraint if required).
- Database assumes PostgreSQL, but Prisma schema can be adjusted if you prefer another supported SQL provider.

---

## Notes

- The application focuses on clarity, stability, and realistic usability rather than feature breadth.
- UI includes meaningful loading, empty, and error states to match production expectations.

