# VYDRAX Security 🛡️

**A Web-Based Security Risk Analysis Platform**

VYDRAX Security is a web application designed to analyze submitted URLs or text for potential security risks and present the results through a dashboard. It combines a React frontend with a Python FastAPI backend to provide a simple interface for security risk assessment.

## ✨ Features

- **User Authentication:** Register and log in to access the application.
- **Security Scanning:** Submit supported input for heuristic-based risk analysis.
- **Risk Assessment:** Display a risk score and risk level.
- **Evidence-Based Results:** Present findings that help users understand potential warning signs.
- **Interactive Dashboard:** View scan results through a React-based user interface.
- **REST API:** Connect the frontend and backend using FastAPI.
- **SQLite Database:** Store application data locally during development.

## 🧰 Tech Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Backend | Python, FastAPI |
| Database | SQLite |
| Authentication | JWT |
| API Communication | HTTP / REST |

## 📁 Project Structure

```text
hackathon project/
├── .gitignore
├── venv/
└── frontend/
    ├── backend/
    │   └── main.py
    ├── public/
    ├── src/
    │   ├── api.js
    │   ├── App.jsx
    │   ├── Dashboard.jsx
    │   ├── Dashboard.css
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Python 3
- Node.js and npm
- Git
- Visual Studio Code (recommended)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nandithatriparna/vydrax-security.git
cd vydrax-security
```

### 2. Set up the Python backend

Open a terminal in the project root and activate the virtual environment if it already exists.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies required by your application:

```powershell
pip install fastapi "uvicorn[standard]" PyJWT
```

If your backend uses additional Python packages, install those too.

### 3. Start the backend

```powershell
cd frontend/backend
python -m uvicorn main:app --reload
```

The backend should be available at:

- API base URL: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

Keep this terminal running.

### 4. Start the frontend

Open a **second terminal** in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

Keep both terminals running while using the application.

## 🔌 API Overview

The backend includes the following routes:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve the authenticated user's details |
| POST | `/scan` | Submit input for security risk analysis |

For request formats and response details, run the
