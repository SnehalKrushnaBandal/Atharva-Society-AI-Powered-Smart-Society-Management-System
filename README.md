# Rajarshi Darshan Society Management System

A complete society management web application built with **Next.js 14 + Express.js + MongoDB**.

## 🏢 Overview

This system manages daily operations for Rajarshi Darshan housing society (~40 flats), including:

- **Maintenance Collection** - ₹1000/month with Razorpay integration
- **Lift Emergency Alerts** - Instant email notifications to all residents
- **Complaints Management** - File and track complaints with image uploads
- **Asset Tracking** - Monitor society assets (lift, water pump, generator)
- **Watchman Portal** - Gate log and emergency management

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Backend | Express.js, Node.js |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt |
| Payments | Razorpay |
| Email | Brevo |
| Images | ImageKit.io |

## 📁 Project Structure

```
Society_Management/
├── client/          # Next.js 14 frontend
├── server/          # Express.js backend
├── PROJECT_PLAN.md  # Implementation plan
├── ARCHITECTURE.md  # System architecture
└── UI_UX_DESIGN.md  # Design specifications
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x LTS
- MongoDB Atlas account
- Razorpay account
- Brevo account
- ImageKit.io account

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd Society_Management
```

2. Install client dependencies:
```bash
cd client
npm install
```

3. Install server dependencies:
```bash
cd ../server
npm install
```

4. Set up environment variables:
- Copy `server/.env.example` to `server/.env`
- Update with your credentials

5. Run development servers:

**Server (Port 4000):**
```bash
cd server
npm run dev
```

**Client (Port 3000):**
```bash
cd client
npm run dev
```

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Manager** | Full access, user management, assign roles |
| **Admin** | Manage complaints, emergencies, view payments |
| **Resident** | Pay maintenance, file complaints, trigger emergency |
| **Watchman** | Gate log, emergency alerts |

## 📱 Features

### For Residents
- View and pay monthly maintenance
- File complaints with photo upload
- Trigger lift emergency alert
- View payment history

### For Admin/Manager
- View all payments and defaulters
- Manage complaints
- Track society assets
- Resolve emergencies

### For Watchman
- Log visitor entries
- Trigger/view emergencies
- Simple mobile-first interface

## 🎬 Demo Videos

| Role | Demo Link |
|------|-----------|
| Manager | [Watch Demo](https://ik.imagekit.io/xh3awoalr/Portfolio/Manager_Screen_Recording.mp4) |
| Resident | [Watch Demo](https://ik.imagekit.io/xh3awoalr/Portfolio/Resident_Screen_Recording.mp4) |
| Watchman | [Watch Demo](https://ik.imagekit.io/xh3awoalr/Portfolio/Watchman_Screen_Recording.mp4) |

## 🔗 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new resident
- `GET /api/maintenance` - Get maintenance status
- `POST /api/emergency/trigger` - Trigger emergency
- `GET /api/complaints` - Get complaints

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete API documentation.

## 📧 Email Notifications

- Maintenance invoice (1st of month)
- Payment reminders (Day 10, 16)
- Payment confirmation
- Emergency alerts
- Complaint status updates
- Password reset OTP

## 🔐 Security

- JWT authentication with httpOnly cookies
- bcrypt password hashing
- CORS protection
- Helmet security headers
- Input validation

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **New Project** → Import your GitHub repo
4. Set **Root Directory** to `client`
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxx
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   ```
6. Click **Deploy**

### Backend (Render with Docker)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Name:** rajarshi-darshan-api
   - **Root Directory:** server
   - **Runtime:** Docker
   - **Branch:** main
6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   RAZORPAY_KEY_ID=rzp_live_xxxx
   RAZORPAY_KEY_SECRET=xxxx
   BREVO_API_KEY=xkeysib-xxxx
   BREVO_SENDER_EMAIL=noreply@yourdomain.com
   BREVO_SENDER_NAME=Rajarshi Darshan Society
   IMAGEKIT_PUBLIC_KEY=public_xxxx
   IMAGEKIT_PRIVATE_KEY=private_xxxx
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   CLIENT_URL=https://your-vercel-frontend.vercel.app
   OTP_EXPIRY_MINUTES=10
   ```
7. Click **Create Web Service**

### Post-Deployment

1. Update MongoDB Atlas IP whitelist (allow `0.0.0.0/0` for Render)
2. Configure Razorpay webhook URL: `https://your-backend.onrender.com/api/payment/webhook`
3. Test all features in production

## 🐳 Docker (Local Development)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## 📄 License

ISC

## 👨‍💻 Author

Aayush Vaghela
