# 🎓 BRACU Research Thesis Management System

> **A full-stack web platform built to streamline the entire BRACU Thesis process — from proposal submission to evaluation and archiving.**

---

## 🚀 Overview

The **BRACU Research Thesis Management System** is designed to simplify and automate the research and thesis workflow for students, supervisors, and administrators at **BRAC University**.
It provides a centralized platform for managing proposals, supervising feedback, scheduling meetings, and accessing academic papers via the **arXiv API**.

This system consists of two major repositories:

🔗 **Frontend (Client):** [BRACU-Research-Thesis-client](https://github.com/IFTI-KAR/BRACU-Research-Thesis-client)
🔗 **Backend (Server):** [BRACU-Research-server](https://github.com/IFTI-KAR/BRACU-Research-server)

---

## 🏗️ System Architecture

### **Frontend (Client)**

* Built with **React.js** and **Firebase**
* Implements role-based dashboards for Students, Supervisors, and Admins
* Uses **Firebase Authentication** for secure login
* Integrated with **arXiv API** for research paper search
* Hosted on **Vercel**

📂 **Key Directories**

```
src/
 ├── AuthContext.jsx
 ├── AuthProvider.jsx
 ├── firebase/
 │    └── firebase.init.js
 ├── layouts/
 │    └── RootLayout.jsx
 ├── pages/
 │    ├── Admin/
 │    │    ├── AssignSupervisor.jsx
 │    │    ├── CreateFaqs.jsx
 │    │    └── ManageUsers.jsx
 │    ├── Announcement/
 │    ├── Authentication/
 │    ├── Dashboard/
 │    │    ├── AdminDashboard.jsx
 │    │    ├── StudentDashboard.jsx
 │    │    └── SupervisorDashboard.jsx
 │    ├── Home/
 │    │    ├── HeroSection.jsx
 │    │    ├── Home.jsx
 │    │    ├── RecentFaqs.jsx
 │    │    ├── Search.jsx
 │    │    └── ThesisWorkflow.jsx
 │    ├── Meeting/
 │    │    └── ScheduleMeetings.jsx
 │    ├── Semester/
 │    │    └── Semester.jsx
 │    ├── Student/
 │    │    ├── Profile.jsx
 │    │    ├── Recommended.jsx
 │    │    ├── SavedPapers.jsx
 │    │    └── SearchPaper.jsx
 │    ├── StudentGroup/
 │    │    ├── CreateGroup.jsx
 │    │    └── FindGroup.jsx
 │    ├── SupGroups/
 │    └── Supervisor/
 │
 └── Shared/
```

---

### **Backend (Server)**

* Built with **Node.js**, **Express**, and **MongoDB**
* Handles secure API endpoints for user management, proposal submission, grading, and deadlines
* Deployable via **Vercel**

📦 **Server Root Structure**

```
├── index.js
├── package.json
├── package-lock.json
├── vercel.json
├── .gitignore
├── node_modules/
└── .vscode/
```

---

## 🔐 Functional Requirements

### **1. User Management**

* Secure registration and login via **Firebase Authentication**
* Role-based access control (RBAC) for **Students**, **Supervisors**, and **Admins**
* Secure logout and session termination

---

### **2. Student Module**

* 📄 **Thesis Proposal Submission:** Upload title, abstract, domain, supervisor, and documents (PDF)
* 🔍 **Proposal Status Tracking:** View statuses like *Pending*, *Approved*, *Rejected*
* 💬 **View Supervisor Feedback:** Access comments and suggestions
* ⏰ **Timeline & Deadlines:** View thesis milestones and submission schedules
* 🔎 **Search Research Papers (arXiv API):** Find papers by keyword or topic
* 📚 **Save Papers:** Bookmark arXiv papers for later reference
* 📥 **Download Final Thesis & References:** Export thesis and cited research list

---

### **3. Supervisor Module**

* 📝 **Proposal Review:** Approve/reject proposals and leave feedback
* 🧮 **Assign Grades:** Evaluate and finalize student performance
* 👨‍🎓 **View Assigned Students:** See thesis progress by student
* 🔗 **Recommend Papers (arXiv):** Suggest academic resources to students
* 📅 **Schedule Meetings:** Plan review sessions with assigned students

---

### **4. Admin Module**

* 👥 **User Account Management:** Create, update, or delete student/supervisor accounts
* 🧭 **Supervisor Assignment:** Manually or automatically assign supervisors
* 🕒 **Deadline Management:** Configure submission and progress report deadlines
* 📢 **System Announcements:** Publish notices visible to all users

---

### **5. Common System Features**

* ✉️ **Email Notifications:** Alerts for proposal approvals, feedback, and deadlines
* 🔎 **Search & Filter:** Search across thesis topics, papers, authors, and submission dates
* ❓ **FAQs Section:** Provide answers to common student and supervisor questions
* 👥 **Find Groupmates:** Connect students based on research interest
* 🧠 **Supervisor Blog Section:** Supervisors can post blogs and tips for students
* 📘 **Comprehensive Thesis Listing:** Displays all ongoing theses with supervisors, students, and statuses

---

## ⚙️ Tech Stack

| Layer               | Technologies                                               |
| ------------------- | ---------------------------------------------------------- |
| **Frontend**        | React.js, React Router, Context API, Firebase, TailwindCSS |
| **Backend**         | Node.js, Express.js, MongoDB                               |
| **Authentication**  | Firebase Auth                                              |
| **API Integration** | arXiv API                                                  |
| **Deployment**      | Vercel                                                     |
| **Version Control** | Git & GitHub                                               |

---

## 🧩 Key Features Summary

✅ Role-based Dashboards (Admin / Supervisor / Student)
✅ Firebase Authentication & Secure Session Management
✅ Proposal & Feedback Workflow
✅ Meeting Scheduler
✅ arXiv Integration for Academic Research
✅ Dynamic Deadlines & Announcements
✅ Supervisor Blogs & FAQ System

---

## 🧑‍💻 Installation Guide

### **1. Clone Repositories**

```bash
# Clone both client and server
git clone https://github.com/IFTI-KAR/BRACU-Research-Thesis-client
git clone https://github.com/IFTI-KAR/BRACU-Research-server
```

### **2. Setup Client**

```bash
cd BRACU-Research-Thesis-client
npm install
npm run dev
```

### **3. Setup Server**

```bash
cd BRACU-Research-server
npm install
npm start
```

### **4. Environment Variables**

Add a `.env` file for both client and server with the following:

#### **Client (.env)**

```
VITE_FIREBASE_API_KEY=AIzaSyAOYuacz4fo1SE3mCNL5ssrNT1JirZyiAI
VITE_FIREBASE_AUTH_DOMAIN=bracu-research-connect.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bracu-research-connect
VITE_FIREBASE_STORAGE_BUCKET=bracu-research-connect.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=947640377158
VITE_FIREBASE_APP_ID=1:947640377158:web:260b9b71d87527a2eecf47
```

#### **Server (.env)**

```
DB_USER=bracu-research-admin
DB_PASS=ePUqucSrt2lUJ7Dc
```

---

## 🌐 Deployment

* Frontend hosted on **Vercel**
* Backend deployed via **Vercel / Render / Railway**
* Continuous Integration via GitHub

---

## 🧠 Future Enhancements

* AI-based paper recommendations via topic modeling
* Real-time chat between supervisors and students
* Automated plagiarism detection for thesis uploads
* Integration with BRACU’s institutional repository

---

## 📄 License

This project is licensed under the **MIT License** — you are free to use, modify, and distribute it with attribution.


