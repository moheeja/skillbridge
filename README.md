<<<<<<< HEAD
# 🎓 SkillBridge — Attendance Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-0d9488?style=for-the-badge)](https://skillbridge-frontend-opal.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-1a237e?style=for-the-badge)](https://skillbridge-backend-4eza.onrender.com)


> A role-based attendance management system for skill development programs — connecting Students, Trainers, Institutions, Programme Managers, and Monitoring Officers in one platform.

---
=======
🎓 SkillBridge — Attendance Management System

SkillBridge is a role-based attendance management system built for a fictional state-level skilling programme. This project was developed as part of the Full Stack Developer Intern assignment for Sustainable Living Lab.

***
>Note: `node_modules` folders are not included in this submission. Please run `npm install` separately inside both `frontend` and `backend`.
>>>>>>> 7406610 (Add README and contact details)

## 🌐 Live URLs

| Service | URL |
|---------|-----|
<<<<<<< HEAD
| 🖥️ Frontend | https://skillbridge-frontend-opal.vercel.app |
| ⚙️ Backend API | https://skillbridge-backend-4eza.onrender.com |

---

## ✨ Features

- 🔐 **Secure Authentication** — OTP-based login via Clerk with JWT tokens
- 👥 **5 User Roles** — Student, Trainer, Institution, Programme Manager, Monitoring Officer
- 📦 **Batch Management** — Trainers create batches and generate invite tokens
- 🔗 **Invite System** — Students join batches using Batch ID + Secret Token
- ✅ **Attendance Tracking** — Mark Present / Late / Absent per session
- 📊 **Institution Dashboard** — View stats, batch summaries, attendance counts
- 📈 **Programme Reports** — Overall attendance rate with visual progress bar
- ☁️ **Fully Cloud Deployed** — Vercel + Render + Neon PostgreSQL

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| Authentication | Clerk |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| 🎓 Student | Join batches, mark attendance, view sessions |
| 👨‍🏫 Trainer | Create batches, sessions, generate invites |
| 🏫 Institution | View all batches, stats, summaries |
| 📊 Programme Manager | View programme-wide attendance rate |
| 👁️ Monitoring Officer | Read-only access to all data |

---

## 👨‍💻 Author

**Moheeja** — [@moheeja](https://github.com/moheeja)

---

<div align="center">
Made with ❤️ for skill development programs<br>
<strong>SkillBridge — Bridging Skills and Attendance</strong>
</div>
=======
| Frontend | https://skillbridge-frontend-opal.vercel.app |
| Backend API | https://skillbridge-backend-4eza.onrender.com |

> Note: The backend is hosted on Render free tier, so the first request may take 30–60 seconds to wake up.

***

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | shaikmoheeja057+student@gmail.com | Test@1234 |
| Trainer | shaikmoheeja057+trainer@gmail.com | moheeja1 |
| Institution | shaikmoheeja057+institution@gmail.com | moheeja1 |
| Programme Manager | shaikmoheeja057+pm@gmail.com | moheeja1 |
| Monitoring Officer | shaikmoheeja057+monitor@gmail.com | moheeja1 |

> All accounts are pre-created and ready to use.

***

## ✅ Implemented Features

### Authentication & Access Control
- Clerk-based authentication using email/password and JWT token verification
- Role-based routing for all 5 roles
- Server-side role validation on protected backend routes
- Monitoring Officer has read-only access only

### Student
- Join batch using Batch ID and invite token
- View assigned sessions
- Mark attendance as Present / Late / Absent

### Trainer
- Create batches
- Create sessions with title, date, start time, and end time
- Generate invite tokens for students

### Institution
- View all batches
- See total trainers and total students
- View attendance summaries per batch

### Programme Manager
- View programme-wide attendance summary
- See overall counts of present, absent, and late

### Monitoring Officer
- View read-only dashboard with programme-wide summary
- No create, update, or delete permissions

***

## ⚠️ Partially Implemented

- Dedicated per-session trainer attendance detail view is not fully exposed in the UI
- Institution-wise drill-down for programme manager summary is not fully implemented

***

## ❌ Not Implemented

- Email notifications
- Pagination for large datasets
- Student removal from batches by admin

***

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | React + Vite | Fast development, simple component architecture |
| Backend | Node.js + Express | Lightweight and suitable for REST APIs |
| Database | PostgreSQL (Neon) | Strong relational model for attendance workflows |
| Authentication | Clerk | Handles email/password auth and JWT securely |
| Frontend Hosting | Vercel | Easy deployment for React apps |
| Backend Hosting | Render | Easy Express deployment with environment variable support |

***

## 🗄️ Database Design

### Main tables
- `users`
- `batches`
- `batch_trainers`
- `batch_students`
- `sessions`
- `attendance`

### Key decisions
- `clerk_user_id` is stored in the `users` table to connect Clerk auth with internal user records
- `UNIQUE(session_id, student_id)` prevents duplicate attendance records
- Invite tokens are generated securely and tied to each batch
- Roles are stored in the database so the backend can enforce authorization independently

***

## 🔄 Invite Flow

1. Trainer creates a batch
2. Trainer generates an invite token
3. Student enters Batch ID and token
4. Backend verifies both values
5. Student is enrolled into the batch
6. Student can then view sessions and mark attendance

***

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- Git

### Clone repository
```bash
git clone https://github.com/moheeja/skillbridge.git
cd skillbridge
```

### Backend setup
```bash
cd backend
npm install
```

Create `.env` in backend:
```env
DATABASE_URL=your_neon_database_url
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Run backend:
```bash
node index.js
```

### Frontend setup
```bash
cd frontend
npm install
```

Create `.env` in frontend:
```env
VITE_API_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Run frontend:
```bash
npm run dev
```

***

## 💭 What I Would Improve Next

If given more time, I would add institution-level analytics, pagination, and notification workflows. I would also improve the trainer experience by exposing detailed attendance breakdowns for each session directly in the UI.

***

## 👨‍💻 Author

**Shaik Moheeja**
- Email: shaikmoheeja057@gmail.com
- Phone: 7993607556
- GitHub: [@moheeja](https://github.com/moheeja)

***

Built for the Sustainable Living Lab Full Stack Developer Intern Assignment.
>>>>>>> 7406610 (Add README and contact details)
