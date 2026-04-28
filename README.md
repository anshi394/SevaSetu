<h1 align="center">
  <br>
  <img src="https://img.shields.io/badge/SevaSetu-NGO%20Resource%20Platform-6366f1?style=for-the-badge" alt="SevaSetu">
  <br>
  SevaSetu — Intelligent NGO Resource Management Platform
  <br>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

<p align="center">
  A full-stack, multi-tenant NGO operations platform with intelligent volunteer-task matching, real-time dashboards, and role-based access for Admins and Volunteers.
</p>

---

## 🌟 Features

### 🔐 Authentication & Multi-Tenancy
- **Admin Signup/Login** with JWT-based authentication
- **Volunteer Portal** with email + passkey login
- Full **data isolation** — each Admin only sees their own data

### 🧠 Intelligent Matching Engine
- Auto-assigns volunteers to tasks based on **skills + location**
- **Partial task support** — if only some resources are available, partial task is created
- **Awaiting Logistics** state — when a volunteer is eligible but resources are zero, the system flags it rather than blocking
- Generates **critical alerts** for unresolved high-priority needs

### 📊 Real-time Dashboard
- Live stat cards: Total Needs, High Priority, Active Tasks, Available Volunteers
- **Needs by Type** chart — color-coded breakdown per category
- **Task Priority Distribution** — color-coded by urgency (Red/Amber/Green)

### 📋 Task Management
- Auto-generated tasks from uploaded needs
- Status flow: `Queued → In Progress → Completed`
- **Awaiting Logistics** status when volunteer exists but no resources

### 🙋 Volunteer Dashboard
- Volunteers log in with email + passkey
- View assigned tasks with need details
- **Manually mark resources used** after completing a task

### 📤 Data Upload Center
- **CSV Bulk Upload** for: Needs, Volunteers, Resources, Facilities
- **Manual Entry Forms** for all 4 entity types
- System auto-generates IDs — no manual ID entry needed

### 👥 Volunteer Directory
- Admin can see all volunteers with their **ID, Email, and Passkey**
- Makes it easy to share credentials with volunteers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS with glassmorphism design |

---

## 📁 Project Structure

```
SevaSetu/
├── backend/
│   ├── models/          # Mongoose schemas (Admin, Volunteer, Need, Task, etc.)
│   ├── routes/          # Express API routes (auth, modules, upload, volunteer)
│   ├── middleware/       # JWT auth middleware
│   ├── services/        # Intelligence Engine (matching logic)
│   └── server.js        # Entry point
│
├── frontend/
│   ├── app/             # Next.js pages (dashboard, login, signup, tasks, etc.)
│   ├── components/      # Reusable components (Sidebar, DataTable, AuthWrapper)
│   └── public/
│
├── sample_data/         # Sample CSV files for testing
│   ├── volunteers.csv
│   ├── needs.csv
│   ├── resources.csv
│   └── facilities.csv
│
└── README.md
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/SevaSetu.git
cd SevaSetu
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sevasetu
JWT_SECRET=sevasetu-super-secret-key-2026
```
Start the backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 📊 Sample Data

Sample CSV files are provided in the `sample_data/` folder. Upload them in this order via the Upload Center:

1. `resources.csv`
2. `facilities.csv`
3. `needs.csv`
4. `volunteers.csv` ← triggers auto-matching

---

## 👤 Default Volunteer Credentials (after CSV upload)

| Field | Value |
|-------|-------|
| Email | (as in CSV e.g. `rahul@example.com`) |
| Passkey | `Volunteer123` |

---

## 🧩 System Flow

```
Admin Signs Up → Uploads Data → Intelligence Engine Runs
→ Tasks Created → Volunteers Assigned (or Awaiting Logistics)
→ Volunteer Logs In → Views Tasks → Marks Resources Used
→ Admin Dashboard Updates in Real Time
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Built with ❤️ for humanitarian impact</p>
