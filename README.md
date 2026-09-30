# 🎓 BRACU Research Thesis Management Portal 

> **A full-stack application containing both the Frontend client and Backend API server designed to automate the entire thesis workflow at BRAC University.**

---

## 📌 Project Overview

This repository holds the complete codebase for the **BRACU Research Thesis Management System**. It streamlines proposal submission, evaluation, announcements, meeting scheduling, and thesis archiving for **Students**, **Supervisors**, and **Admins**.

* **Frontend Client (Vite + React)**: Accessible under `BRACU-Research-Thesis-client-main/`
* **Backend Server (Express + MongoDB)**: Accessible under `BRACU-Research-server-main/`

---

## 🚀 Live Demo & Repository Links

* 🖥️ **Live Client App**: [https://bracu-research-connect.web.app](https://bracu-research-connect.web.app) (Firebase Hosting)
* ⚙️ **Live Backend API**: [https://bracu-research-server-eta.vercel.app](https://bracu-research-server-eta.vercel.app)
* 📂 **GitHub Repository**: [https://github.com/IFTI-KAR/BRAC-University-Thesis-Portal](https://github.com/IFTI-KAR/BRAC-University-Thesis-Portal)

---

## 🏗️ Repository Architecture & Directories

```text
BRAC-University-Thesis-Portal/
├── BRACU-Research-Thesis-client-main/  # React + Vite Client App
│   ├── public/                         # Static Assets & Logos
│   ├── src/                            # Component Source Code
│   │   ├── components/                 # Reusable UI Controls
│   │   ├── contexts/                   # Auth & User Context Providers
│   │   ├── layouts/                    # Root Page Layout
│   │   ├── pages/                      # Role-specific Views & Dashboards
│   │   └── routers/                    # Router Configuration
│   ├── package.json                    # Dependencies & Run Scripts
│   └── vercel.json                     # Vercel SPA Routing Configuration
│
├── BRACU-Research-server-main/         # Express.js Server
│   ├── index.js                        # API Gateway & Endpoints
│   ├── package.json                    # Server Dependencies
│   └── vercel.json                     # Vercel Serverless Function Config
│
└── .gitignore                          # Monorepo-level gitignore
```

---

## ⚙️ Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js (v19), React Router v7, Tailwind CSS, DaisyUI v5, Context API, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | Firebase Authentication |
| **APIs** | arXiv API (for academic paper lookup) |
| **Deployment** | Firebase Hosting (Client) & Vercel (Server / Client) |

---

## 🧑‍💻 Installation & Local Running Guide

To run the full-stack portal locally, you need to spin up both the frontend client and the backend server.

### **1. Setup and Run the Server**
Navigate to the server directory, install dependencies, and run:
```bash
cd BRACU-Research-server-main
npm install
npm start
```
Make sure to configure the environment variables in `BRACU-Research-server-main/.env`:
```env
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
```

### **2. Setup and Run the Client**
In a new terminal window, navigate to the client directory, install dependencies, and run the development server:
```bash
cd BRACU-Research-Thesis-client-main
npm install
npm run dev
```
Make sure to configure the environment variables in `BRACU-Research-Thesis-client-main/.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=bracu-research-connect.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bracu-research-connect
VITE_FIREBASE_STORAGE_BUCKET=bracu-research-connect.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔒 Role-Based Key Features

### 👨‍🎓 Student Features
* **Thesis Groups**: Form groups of 1–5 members, send invites, and manage teammates.
* **Proposals**: Submit research proposals to faculty with abstract, domain, and file attachments.
* **arXiv Integration**: Search, bookmark, and save arXiv papers directly inside the portal.
* **Meeting Manager**: View scheduled supervision meetings.

### 👨‍🏫 Supervisor Features
* **Group Management**: Accept/reject thesis group proposals.
* **arXiv Recommendations**: Recommend relevant papers directly to assigned student groups.
* **Scheduler**: Schedule progress evaluation sessions and meetings.
* **Feedback System**: Provide detailed written feedback on submissions.

### 🛡️ Admin Features
* **Semester Setup**: Manage deadlines, track thesis progress milestones, and start new semesters.
* **Supervisor Matching**: Manually assign/allocate supervisors to thesis groups.
* **Announcements**: Publish global announcements to notify all students and supervisors.
* **User Management**: Search, promote, or deprecate roles (Student, Supervisor, Admin).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) (if present) or subdirectories for more details.
