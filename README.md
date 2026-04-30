# Team Task Manager

This is a full stack Team Task Manager app where users can create projects, invite teammates, assign tasks, and track progress.

The project is built for a coding assignment and follows the required stack:
- React.js (frontend)
- Node.js + Express (backend)
- MongoDB + Mongoose (database)
- Tailwind CSS (UI)

## What this app can do

- Signup and login using JWT authentication
- Create projects (creator becomes project Admin)
- Add or remove members in a project (Admin only)
- Create tasks with title, description, due date, and priority
- Assign tasks to project members
- Update task status (`To Do`, `In Progress`, `Done`)
- Role-based behavior:
  - Admin can manage team members and tasks
  - Member can view/update only allowed tasks
- Dashboard insights:
  - Total tasks
  - Tasks by status
  - Tasks per user
  - Overdue tasks

## Folder structure

- `client` -> React frontend
- `server` -> Express backend
- `client/.env.example` -> frontend environment template
- `server/.env.example` -> backend environment template

---

## Run locally

### 1) Backend setup

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

### 2) Frontend setup

```bash
cd client
npm install
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

---

## Main API routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`

### Tasks
- `POST /api/tasks`
- `GET /api/tasks/project/:projectId`
- `GET /api/tasks/my-tasks`
- `GET /api/tasks/dashboard/:projectId`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

---

## Developer quality upgrades included

- Split frontend into reusable components (`DashboardHeader`, `ManagementPanel`, `TaskBoard`, `SummaryCards`)
- Strong API request validation with `express-validator`
- Clear field-level validation errors for bad requests
- Multi-assignee task support with proper role checks
- Environment variable templates for local and deployment setup

---

## Deployment on Railway

Deploy backend and frontend as separate services.

### Backend env variables on Railway
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `FRONTEND_URL` (your deployed frontend URL)
- `NODE_ENV=production`

### Frontend env variable on Railway
- `VITE_API_URL=https://<your-backend-domain>/api`

---

