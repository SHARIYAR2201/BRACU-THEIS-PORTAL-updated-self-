# 🎓 BRACU Research Thesis Management Portal

> A full-stack web platform for managing the thesis and research workflow of BRAC University from a centralized interface.

---

## 📌 Project Overview

The **BRACU Research Thesis Management System** provides a shared platform for **Students, Supervisors, and Administrators** to manage major stages of the thesis process.

The system supports research proposal submission, thesis-group coordination, academic paper discovery, supervision meetings, feedback, announcements, semester management, and supervisor allocation.

### Main Applications

- **Frontend:** `BRACU-Research-Thesis-client-main/`
- **Backend:** `BRACU-Research-server-main/`

---

## 🚀 Live Services

- 🖥️ **Client Application:** https://bracu-research-connect.web.app
- ⚙️ **Backend API:** https://bracu-research-server-eta.vercel.app
- 📂 **GitHub Repository:** https://github.com/IFTI-KAR/BRAC-University-Thesis-Portal

---

## 🏗️ Repository Structure

```text
BRAC-University-Thesis-Portal/
├── BRACU-Research-Thesis-client-main/
│   ├── public/                         # Static resources and branding
│   ├── src/
│   │   ├── components/                 # Shared React components
│   │   ├── contexts/                   # Authentication and user contexts
│   │   ├── layouts/                    # Application layouts
│   │   ├── pages/                      # Pages and role-based dashboards
│   │   └── routers/                    # Routing configuration
│   ├── package.json                    # Client dependencies and scripts
│   └── vercel.json                     # SPA deployment configuration
│
├── BRACU-Research-server-main/
│   ├── index.js                        # Express server and API endpoints
│   ├── package.json                    # Server dependencies and scripts
│   └── vercel.json                     # Server deployment configuration
│
└── .gitignore                          # Git ignore rules
```

---

## ⚙️ Technology Stack

| Area | Technologies |
| :--- | :--- |
| **Frontend** | React.js 19, React Router 7, Tailwind CSS, DaisyUI 5, Context API, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | Firebase Authentication |
| **External API** | arXiv API |
| **Deployment** | Firebase Hosting and Vercel |

---

## 🧑‍💻 Local Development Setup

The frontend and backend are separate applications, so both need to be configured and started during local development.

### 1. Backend Setup

Open a terminal and enter the server directory:

```bash
cd BRACU-Research-server-main
npm install
npm start
```

Create the following file:

`BRACU-Research-server-main/.env`

```env
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
```

Do not commit the `.env` file to Git.

---

### 2. Frontend Setup

Open a second terminal and enter the client directory:

```bash
cd BRACU-Research-Thesis-client-main
npm install
npm run dev
```

Create/configure:

`BRACU-Research-Thesis-client-main/.env`

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=bracu-research-connect.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bracu-research-connect
VITE_FIREBASE_STORAGE_BUCKET=bracu-research-connect.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 🔐 Environment Variable Security

Never place real API keys, passwords, tokens, or other credentials directly inside source files or the README.

Use environment variables instead, and make sure local environment files are excluded through `.gitignore`.

Example:

```gitignore
.env
.env.*
!.env.example
```

If a credential has already been committed to GitHub, removing it from the latest version of the file is **not enough**. The exposed credential should be revoked/rotated, and the old value should be removed from Git history when necessary.

---

## 🔒 Features by User Role

### 👨‍🎓 Student

- **Thesis Groups:** Create groups containing 1–5 members, invite students, and manage group membership.
- **Research Proposals:** Submit proposals containing an abstract, research domain, and supporting files.
- **arXiv Search:** Find academic papers through the integrated arXiv service.
- **Bookmarks:** Save relevant research papers for later use.
- **Meeting Manager:** View scheduled thesis-supervision meetings.

### 👨‍🏫 Supervisor

- **Group Review:** Accept or reject thesis-group proposals.
- **Research Recommendations:** Share relevant arXiv papers with assigned student groups.
- **Meeting Scheduler:** Arrange progress evaluations and supervision sessions.
- **Feedback:** Provide written feedback on student submissions.

### 🛡️ Administrator

- **Semester Management:** Configure deadlines, monitor thesis milestones, and initiate new semesters.
- **Supervisor Assignment:** Allocate supervisors to thesis groups.
- **Announcements:** Publish announcements for students and supervisors.
- **User Management:** Search users and manage Student, Supervisor, and Admin roles.

---

## 🔐 Security Notice

This repository should contain **configuration templates rather than real credentials**.

If GitHub reports a detected secret:

1. Treat the exposed credential as compromised.
2. Revoke or rotate the affected API key immediately.
3. Replace the credential with an environment variable.
4. Remove the secret from the repository's Git history if required.
5. Push the cleaned history to GitHub.
6. Re-scan the repository and close the GitHub secret-scanning alert after remediation.

---

## 📄 License

This project is distributed under the **MIT License**.

See the `LICENSE` file for the complete license terms, if it is included in the repository.
