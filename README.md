# CampusConnect — MIT-WPU Lost & Found

A web-based Lost & Found Management System designed for the MIT-WPU campus community. Built using React, Vite, Django REST Framework, and PostgreSQL.

## 🌐 Live Project

| Component | Link |
|---|---|
| **Live Frontend** | https://campusconnect-frontend-ten.vercel.app/ |
| **Backend API** | https://campusconnect-backend-itee.onrender.com/ |
| **GitHub Repository** | https://github.com/itsNikhil18/CampusConnect-Lost-Found |

## 📌 Project Overview

CampusConnect helps students and staff report, search, and recover lost belongings within the campus community.

Users can report lost or found items, browse available reports, search for belongings, and manage their submissions through a responsive web interface.

## ✨ Features

- Responsive React frontend with a dashboard.
- Report lost and found items.
- Search and filter reports.
- Upload images of reported items.
- Django REST API for managing reports.
- Student and staff registration.
- JWT-based login authentication.
- MIT-WPU email-domain validation.
- User-specific report dashboard.
- Django admin interface.
- PostgreSQL database for production deployment.

## 🛠️ Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

**Backend**
- Python 3.13
- Django
- Django REST Framework
- Simple JWT

**Database**
- PostgreSQL (production)
- SQLite (local development)

**Deployment**
- Vercel — Frontend hosting
- Render — Backend hosting and PostgreSQL

## 📂 Project Structure

```text
CampusConnect/
│
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── campusconnect/
│   ├── reports/
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

## 💻 Local Installation and Setup

### Requirements

- Python 3.12 or 3.13
- Node.js and npm
- Git
- VS Code (optional)

### 1. Clone the repository

```bash
git clone https://github.com/itsNikhil18/CampusConnect-Lost-Found.git
cd CampusConnect-Lost-Found
```

### 2. Start the backend

Open a terminal in the project folder:

```powershell
cd backend
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend API:

http://127.0.0.1:8000/api/reports/

Django Admin:

http://127.0.0.1:8000/admin/

To create an administrator account:

```powershell
python manage.py createsuperuser
```

### 3. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL provided by Vite, usually:

http://localhost:5173

## 🔐 Authentication Notes
