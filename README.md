# 🍽️ SmartServe: Real-Time Restaurant Management & Ordering System

**SmartServe** is a premium, real-time, multi-role restaurant management and self-service table ordering platform. Built on a modern tech stack utilizing React, TypeScript, Tailwind CSS, Firestore, and Zustand, it provides automated end-to-end workflows connecting **Customers**, **Waiters**, **Chefs**, and **Administrators** into a unified, live-synced ecosystem.

---

## 🚀 Key Architectural Innovations

### 1. Smart Queue Routing & Kitchen Load Balancer
Rather than simple round-robin assignment, SmartServe features a **Kitchen Scheduler** that tracks:
*   Active prep remaining times.
*   Pending item preparation queues.
*   Mandatory chef break cooldowns (2-minute auto-breaks between orders).
*   Temporary buffers to prevent collision.
It automatically routing new orders to the chef who will be available first.

### 2. Synthesized Web Audio API Notifications
To ensure instant alerting without network latency or static asset dependencies, the Waiter and Chef terminals synthesize chime notifications directly in-browser using the **Web Audio API**. It creates clean double-beep alerts dynamically:
*   `C5 (523.25 Hz)` ➡️ `G5 (783.99 Hz)`
This guarantees high-quality, lightweight alerts on any device.

### 3. Real-Time Sync & Local Session Persistence
Utilizing Firebase Firestore `onSnapshot` real-time listeners, any status update (e.g. Chef marks dish ready, Waiter requests bill, Admin updates menu) propagates instantly across all roles. Active orders and login states persist via Zustand-synced local storage.

---

## 👥 Multi-Role Modules

### 📱 1. Customer Ordering & Checkout
*   **Digital Menu**: Filterable by diet category (All, Veg, Non-Veg) and day slots (Morning, Evening, Night).
*   **Table-Bound Ordering**: Interactive cart mapped to table numbers and guest counts.
*   **Order Tracking**: Real-time progress bar tracking preparation phases (`Confirmed` -> `Preparing` -> `Ready for Pickup` -> `Delivered`).
*   **Digital Billing**: Calculates orders, tax rates, tips, and generates dynamic payment configurations.

### 📟 2. Waiter Terminal App
*   **PIN-based Access**: Fast and secure authentication for staff.
*   **Active Table Dashboard**: Color-coded physical layout maps (`idle`, `ordering`, `waiting`, `billing`, `occupied`).
*   **Task Management**: Shows assigned tables and active orders with quick action triggers (e.g., mark delivered, collect tip).
*   **Performance Metrics**: Live tracker showing total deliveries, rating, and tips collected today.

### 👨‍🍳 3. Chef Kitchen Display Console
*   **Auto-Ticking Timer Queue**: Automatic countdown timers for each active order.
*   **Queue States**: Displays upcoming orders (`New`), currently cooking dishes (`Preparing`), and completed food (`Ready`).
*   **Break Mechanism**: Tracks chef fatigue, automatically starting breaks and resuming task queues when complete.

### 📊 4. Admin Management Control Center
*   **Global Dashboard**: Real-time widgets tracking total revenue, active tables, active kitchen load, and pending reservations.
*   **CCTV Camera Simulator**: Mock monitoring console displaying frame rates, camera connectivity, and active kitchen status.
*   **Menu & Staff Management**: CRUD interfaces for adding/removing menu options, registering waiters and chefs with access PINs.
*   **Analytics & Reviews**: Visual charts showcasing business performance, food ratings, and guest feedbacks.
*   **Kitchen Display System (KDS)**: A standalone full-screen console screen for kitchen wall monitors.

---

## 🛠️ Technology Stack

*   **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
*   **State Management**: [Zustand v5](https://github.com/pmndrs/zustand)
*   **Database & Auth**: [Firebase v12](https://firebase.google.com/) (Cloud Firestore, Storage, Auth)
*   **Animations**: [Framer Motion v12](https://www.framer.com/motion/)
*   **Reporting**: [jsPDF](https://github.com/parallax/jsPDF) (for billing and receipt generation)

---

## 📂 Project Organization

```text
SmartServe/
├── database_rules.json     # Firebase Firestore Security & Storage Rules
├── tailwind.config.js       # Tailwind typography, theme extensions & custom variables
├── src/
│   ├── firebase/
│   │   └── config.ts        # Firestore, Storage & Client App Init
│   ├── shared/              # Shared layouts, global components, helpers
│   ├── routes/
│   │   └── index.tsx        # React Router browser router configuration
│   ├── customer/            # Customer module: menu, cart, tracking, checkout
│   │   ├── store/
│   │   │   ├── useCartStore.ts
│   │   │   └── useOrderStore.ts
│   │   └── pages/
│   ├── waiter/              # Waiter module: tables grid, PIN login, metrics
│   │   ├── store/
│   │   │   └── useWaiterStore.ts
│   │   └── pages/
│   ├── chef/                # Chef module: queue management, time ticker
│   │   ├── store/
│   │   │   └── useChefStore.ts
│   │   └── pages/
│   └── admin/               # Admin panel: CCTV simulator, staff manager, analytics
│       ├── store/
│       │   └── useAdminStore.ts
│       └── pages/
```

*   **Design Tokens & CSS Variables Details**: See [DESIGN_SYSTEM.md](file:///e:/vs%20code/UI%20BRO/DESIGN_SYSTEM.md)
*   **Firestore & State Schemas**: See [DATABASE_SCHEMA.md](file:///e:/vs%20code/UI%20BRO/DATABASE_SCHEMA.md)

---

## ⚙️ Setup & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   Firebase Project Credentials

### 1. Installation
Clone the repository and install all node packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and append your Firebase keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Database Security Rules
Copy the JSON configurations inside [database_rules.json](file:///e:/vs%20code/UI%20BRO/database_rules.json) and paste them into the Rules tab in your Firebase Console.

### 4. Running the Project locally
Launch the Vite development server:
```bash
npm run dev
```
The server will boot, by default routing to `http://localhost:5173/`.
