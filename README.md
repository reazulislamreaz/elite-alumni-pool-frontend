# TaskForge — Smart Project & Task Collaboration System

A full-stack MERN application for managing projects, tasks, team members, and
work progress — with role-based access control, business-rule validation, and
analytics. **This repository is the frontend (React + Vite SPA).**

## 🔗 Live & Source

| | |
|---|---|
| **Live App** | https://elite-alumni-pool-frontend.vercel.app |
| **Live API** | https://elite-alumni-pool-backend.vercel.app |
| **Frontend repo** | https://github.com/reazulislamreaz/elite-alumni-pool-frontend |
| **Backend repo** | https://github.com/reazulislamreaz/elite-alumni-pool-backend |

## 🔑 Demo Credentials

One-click demo cards are on the login page. Password for all demo accounts: **`Demo@123456`**

| Role | Email |
|------|-------|
| Admin | `admin@demo.elitepool.com` |
| Project Manager | `manager@demo.elitepool.com` |
| Team Member | `member@demo.elitepool.com` |

> Public signup always creates a **Team Member**; use a demo login to explore
> Admin or Manager access.

## ✨ Features

- **Auth & RBAC** — email/password, JWT, demo login, three roles (Admin, Project Manager, Team Member)
- **Projects** — full CRUD, status (Active / Completed / On Hold), deadline, member management
- **Tasks** — CRUD, assignee (project members only), priority, status, quick status change, bulk actions, progress bars
- **Validation** — duplicate-title, completed-task reassignment, and past-deadline messages
- **Team** — add members, member-wise task lists, workload summary (total / completed / pending)
- **Dashboard** — KPI cards + charts (Tasks by Priority, Status Distribution, Project Progress, Team Productivity), recent activity, upcoming deadlines, high-priority tasks, workload
- **Activity log**, **comments**, **file attachments**, **notifications**
- **Search / filter / sort / pagination**
- **Dark & light mode** (persisted, follows OS), **skeleton loaders**, fully **responsive** with a mobile drawer

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, TypeScript, React Query, Zustand, React Router, Recharts
- **Backend:** Node.js, Express, TypeScript, Mongoose, Zod, JWT (separate repo)
- **Database:** MongoDB (Atlas)

## 🚀 Setup

```bash
cp .env.example .env      # set VITE_API_URL
npm install
npm run dev               # http://localhost:5173
```

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`.

## 🔐 Environment Variables (`.env`)

| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` (local) or `https://elite-alumni-pool-backend.vercel.app/api` (prod) |

## 👤 Role Permissions

- **Admin** — full access
- **Project Manager** — create/manage projects, assign tasks, add members
- **Team Member** — update status on tasks assigned to them only

## ☁️ Deployment (Vercel)

1. Import this repo into Vercel (framework preset: **Vite**; build `npm run build`, output `dist`).
2. Set `VITE_API_URL` to the deployed API base, e.g. `https://elite-alumni-pool-backend.vercel.app/api`.
3. `vercel.json` provides the SPA fallback rewrite so client-side routes work on refresh.
4. After deploy, set the backend's `CLIENT_URL` to this app's URL (CORS).

## 🧪 Build

```bash
npm run build
```
