# 🏢 Atharva Society — AI-Powered Smart Society Management System

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License-MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

## 📖 Project Overview

**Atharva Society** is a comprehensive, production-ready full-stack web application designed for intelligent residential community operations and management. The system simplifies day-to-day operations for residents, committee members, administrators, and security staff through automated maintenance collection, real-time lift emergency dispatch alerts, role-scoped management, asset tracking, and gate visitor logs.

This repository serves as the baseline platform for our **BE Final Year Project**, laying the groundwork for upcoming artificial intelligence (AI) enhancements such as automated NLP complaint classification, RAG-based resident AI assistance, and predictive asset maintenance.

---

## 👥 Project Information & Team

- **Project Title:** AI-Powered Smart Society Management System
- **Brand Identity:** Atharva Society
- **Tagline:** Intelligent Society Management
- **Academic Project:** BE Final Year Project
- **Team:** Group 24
  - **Snehal Bandal**
  - **Shruti Gijbile**
  - **Komal Kamble**

---

## 🎯 Objectives

1. **Streamline Maintenance Payments:** Provide seamless digital collection via UPI and cards with automated billing, late fee calculation, and PDF receipts.
2. **Instant Emergency Response:** Enable one-click emergency triggers for critical incidents (e.g., stuck lift) with instant notifications to all residents and security staff.
3. **Transparent Complaint Resolution:** Offer a structured pipeline for residents to file complaints with image uploads and track resolution status in real-time.
4. **Enhanced Security Management:** Provide security personnel with a mobile-optimized gate portal for real-time visitor entry/exit tracking.
5. **Prepare for AI Integration:** Establish a clean, modular architecture ready for integrating Intelligent AI Assistants, NLP, and OCR.

---

## ⚡ Key Features

- 💳 **Maintenance Collection:** Monthly auto-invoicing (₹1000/month) with Razorpay integration (UPI, Credit/Debit cards, Net Banking), ₹100 late fee rules, and auto-generated PDF receipts.
- 🚨 **Emergency SOS System:** One-click emergency trigger alerting all residents and management via real-time dashboard banners and email notifications.
- 📝 **Complaints Tracking:** Resident complaint submission with image uploads, status updates (*Open → In Progress → Resolved*), and email notifications.
- 🔧 **Asset Management:** Monitor society equipment (lifts, water pumps, generators) with complete maintenance logs and technician status tracking.
- 🚪 **Watchman Gate Portal:** Mobile-first interface for security guards to log incoming/outgoing visitors, vehicle numbers, and view emergency alerts.
- 📧 **Automated Email Notifications:** Transactional emails powered by Brevo for payment reminders, receipts, OTP password resets, and emergency alerts.

---

## 🛠️ Technology Stack

### Frontend (`client/`)
- **Next.js 14** (App Router & React Server/Client Components)
- **TypeScript** (Type safety across UI components and API callers)
- **Tailwind CSS & shadcn/ui** (Utility-first styling & accessible Radix primitives)
- **Axios** (Configured with credentials support)
- **jsPDF** (Client-side payment receipt PDF generation)

### Backend (`server/`)
- **Express.js 4.x** (RESTful API architecture)
- **Node.js 20.x** (Async JavaScript runtime)
- **MongoDB Atlas & Mongoose 8.x** (NoSQL document store & ODM)
- **node-cron** (Scheduled automated billing & late fee processing)
- **Brevo API (formerly Sendinblue)** (Transactional email engine)
- **ImageKit API** (Image CDN and file upload storage)
- **JWT & bcryptjs** (Secure cookie-based authentication & password hashing)

---

## 📁 Repository Structure

```text
Atharva-Society-AI-Powered-Smart-Society-Management-System/
├── client/                     # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/               # App Router pages (Auth, Dashboard, Admin, Watchman)
│   │   ├── components/        # UI primitives & domain widgets (Navbar, Sidebar, etc.)
│   │   ├── context/           # AuthContext & state providers
│   │   ├── hooks/             # Custom React hooks (useAuth, useEmergency, etc.)
│   │   ├── lib/               # Utility functions, API config, receipt generator
│   │   ├── middleware.ts      # Client route protection
│   │   └── types/             # Shared TypeScript definitions
│   └── package.json
│
├── server/                     # Node.js + Express REST API Backend
│   ├── config/                # Database connection & service clients (Brevo, Razorpay, ImageKit)
│   ├── controllers/           # API business logic handlers
│   ├── jobs/                  # Scheduled cron tasks (invoicing, late fees)
│   ├── middleware/            # Auth verification & error handling
│   ├── models/                # Mongoose schemas (User, Maintenance, Complaint, etc.)
│   ├── routes/                # Express route endpoints
│   ├── scripts/               # Database seeder scripts
│   ├── services/              # Email & file upload service wrappers
│   ├── templates/             # HTML templates (API status landing page)
│   ├── server.js              # Server entrypoint
│   └── package.json
│
├── docker-compose.yml          # Container configuration
├── render.yaml                 # Deployment blueprint for Render
├── ARCHITECTURE.md             # In-depth architectural specification
├── SECURITY.md                 # Security reporting policy
└── LICENSE                     # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.x LTS or higher
- **npm** 10.x or higher
- **MongoDB Atlas** database URI
- API Keys for **Razorpay**, **Brevo**, and **ImageKit**

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SnehalKrushnaBandal/Atharva-Society-AI-Powered-Smart-Society-Management-System.git
   cd Atharva-Society-AI-Powered-Smart-Society-Management-System
   ```

2. **Install dependencies**
   ```bash
   # Install Frontend dependencies
   cd client
   npm install

   # Install Backend dependencies
   cd ../server
   npm install
   ```

3. **Configure Environment Variables**

   Create `server/.env` based on `server/.env.example`:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/atharva_society
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   RAZORPAY_KEY_ID=rzp_test_xxxx
   RAZORPAY_KEY_SECRET=xxxx
   BREVO_API_KEY=xkeysib-xxxx
   BREVO_SENDER_EMAIL=noreply@atharvasociety.com
   BREVO_SENDER_NAME=Atharva Society
   IMAGEKIT_PUBLIC_KEY=public_xxxx
   IMAGEKIT_PRIVATE_KEY=private_xxxx
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxxx
   CLIENT_URL=http://localhost:3000
   OTP_EXPIRY_MINUTES=10
   ```

   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxx
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxxx
   ```

4. **Run Development Servers**
   ```bash
   # Terminal 1: Backend API (Port 4000)
   cd server
   npm run dev

   # Terminal 2: Next.js Frontend (Port 3000)
   cd client
   npm run dev
   ```

5. **Access Application**
   - Frontend Web App: [http://localhost:3000](http://localhost:3000)
   - Backend API Health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 👥 User Roles & Permissions

| Role | Access Scope |
|------|--------------|
| **Manager** | Full administrative access, user role assignments, view all society payments/complaints/assets. |
| **Admin** | Management operations: resolve complaints, manage emergencies, view maintenance payments & asset logs. |
| **Resident** | Personal dashboard: pay maintenance dues, download receipts, file complaints, trigger emergency alerts. |
| **Watchman** | Security portal: mobile-first gate visitor entry/exit logging and instant emergency alert access. |

---

## 🔮 Future Scope (Planned AI Enhancements)

Our project roadmap includes integrating specialized AI microservices:

1. **RAG-based Society AI Assistant:** Interactive chatbot trained on society bylaws, maintenance policies, and community announcements to answer resident queries in real-time.
2. **NLP Complaint Triaging:** Automatic sentiment and urgency classification for submitted complaints to automatically prioritize high-urgency issues (e.g., water leaks or electrical hazards).
3. **OCR Document & Gate Security:** Automated vehicle license plate and visitor ID extraction from images to speed up security logging at the main gate.
4. **Predictive Equipment Maintenance:** Machine learning insights based on historical asset service logs to forecast equipment failure before breakdowns occur.

---

## 📄 License & Attribution

This project is licensed under the [MIT License](./LICENSE).
*Original base framework built by Aayush Vaghela; customized, rebranded, and extended by Group 24 for BE Final Year Project.*
