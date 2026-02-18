# HRMS Lite — Human Resource Management System

A lightweight, full-stack HRMS application for managing employees and tracking daily attendance.

## 🖥 Live Demo

- **Frontend:** `https://hrms-lite.vercel.app` *(replace with your deployed URL)*
- **Backend API:** `https://hrms-backend.onrender.com` *(replace with your deployed URL)*

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, CSS Modules |
| Backend | Django 4.2, Django REST Framework |
| Database | PostgreSQL (production), SQLite (development) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## ✨ Features

### Core
- **Employee Management** — Add, view, and delete employees (ID, name, email, department)
- **Attendance Tracking** — Mark Present/Absent per employee per day; delete records
- **Duplicate Prevention** — Unique Employee IDs and emails enforced
- **Validations** — Server-side required fields, email format, duplicate attendance
- **Proper HTTP Codes** — 201 Created, 400 Bad Request, 404 Not Found, etc.

### Bonus
- **Dashboard** — Summary stats (total employees, today's present/absent, untracked)
- **Department breakdown** with bar charts
- **Attendance rate** per employee
- **Filter attendance** by date range, status, and employee
- **Total present days** per employee shown in employee list
- **Employee-specific attendance page** with stats

---

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Create superuser for Django admin
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Create an employee |
| DELETE | `/api/employees/{id}/` | Delete an employee |
| GET | `/api/attendance/` | List attendance (filter: date, status, employee_id) |
| POST | `/api/attendance/` | Mark attendance |
| DELETE | `/api/attendance/{id}/` | Delete attendance record |
| GET | `/api/employees/{id}/attendance/` | Employee's attendance |
| GET | `/api/dashboard/` | Summary stats |

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set REACT_APP_API_URL=http://localhost:8000/api

# Start the development server
npm start
```

The frontend will be available at: `http://localhost:3000`

---

## 🌐 Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Set the **Root Directory** to `backend`
5. Set **Build Command:** `./build.sh`
6. Set **Start Command:** `gunicorn hrms_backend.wsgi:application --bind 0.0.0.0:$PORT`
7. Add environment variables:
   - `SECRET_KEY` — a long random string
   - `DEBUG` — `False`
   - `DATABASE_URL` — provided automatically if you add a PostgreSQL database on Render
8. Add a **PostgreSQL** database in Render and link it to the service

### Frontend (Vercel)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` — your Render backend URL + `/api` (e.g. `https://hrms-backend.onrender.com/api`)
5. Deploy!

---

## 📁 Project Structure

```
hrms/
├── backend/
│   ├── hrms_backend/      # Django project settings
│   ├── employees/         # Employee CRUD app
│   ├── attendance/        # Attendance tracking app
│   ├── requirements.txt
│   ├── Procfile
│   └── build.sh
│
└── frontend/
    ├── public/
    └── src/
        ├── components/    # Layout, UI (reusable)
        ├── pages/         # Dashboard, Employees, Attendance
        ├── services/      # API layer (axios)
        └── index.css      # Global styles + CSS variables
```

---

## 📝 Assumptions & Limitations

- **Single admin user** — No authentication or role-based access is implemented as per requirements
- **One attendance record per employee per day** — enforced at database level
- **Departments** — Predefined list on frontend; can be extended
- **SQLite in dev** — SQLite is used locally for simplicity; PostgreSQL is used in production via `DATABASE_URL`
- The free tier of Render may have cold start delays (~30s) on first request after inactivity
