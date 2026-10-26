# CampusConnect — MIT-WPU Lost & Found

An original starter project for an MIT-WPU campus lost-and-found portal, built with React + Vite and Django REST Framework.

## Included
- React frontend with a responsive dashboard
- Report lost/found items
- Search and filter reports
- Django REST API backed by SQLite
- API endpoint for listing, creating, and updating reports
- Student/staff registration and JWT login starter
- MIT-WPU email-domain validation (not mailbox ownership verification)
- Starter admin site
- Clear separation of frontend and backend

> This is a local development starter. MIT-WPU email verification, real notifications, JWT login, and verified claim workflows are not enabled yet. Add them before using with real student/staff data.

## Requirements
- Python 3.12 or 3.13
- Node.js LTS (includes npm)
- VS Code (optional)

## 1. Start the backend (Windows PowerShell)

Open a terminal in this project folder:

```powershell
cd backend
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

If `py -3.13` is unavailable, use `py -3.12`. Keep this terminal open.
Backend API: http://127.0.0.1:8000/api/reports/
Django admin: http://127.0.0.1:8000/admin/

To create an admin account:
```powershell
python manage.py createsuperuser
```

## 2. Start the frontend

Open a **second** terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, usually http://localhost:5173.

## Authentication notes
- Registration accepts email addresses ending in `@mitwpu.edu.in`; this is a domain check only, not email verification.
- Login uses the Django username and password. During registration, users choose a username.
- JWT access tokens are stored in browser localStorage in this learning starter. For production, use stronger token storage and security review.
- Reporting is gated in the UI behind login; production APIs should also enforce ownership and authentication on report creation.

## Notes
- The frontend talks to the backend at `http://127.0.0.1:8000`.
- SQLite is used for local development; the database file is created after migration.
- Do not put secrets or real credentials in source control.
