# 🎓 SmartServe - Teacher Q&A & Project Study Guide

This document is your preparation sheet for project evaluations, presentations, or demo questions from teachers/examiners. Read this to understand how the project works under the hood.

---

## 🛠️ Topic 1: Technology Stack & Libraries Used

### Q1: What frontend framework did you use and why?
* **Answer**: We used **React (v19)** built with **Vite** as the bundler. 
* **Why?**: React uses a component-based architecture which makes the UI reusable. Vite is used instead of Create-React-App because it uses native ES modules, making build times and browser hot-reloading instantaneous.

### Q2: What is Zustand, and why did you use it instead of Redux?
* **Answer**: **Zustand** is our state management library. It is used to hold app states (like active orders, cart items, and current user sessions) in memory.
* **Why?**: Redux requires too much boilerplate code (actions, reducers, dispatchers). Zustand is extremely lightweight, uses hooks directly, and integrates easily with `localStorage` (via persist middleware) so that refreshing the browser doesn’t log the user out or empty their cart.

### Q3: What is Framer Motion used for?
* **Answer**: It is our **animation library**. We use it to animate progressive wizard step changes, slide-in overlay dialogs, modal fade-ins, and notifications smoothly without causing UI lag.

### Q4: How are notifications handled? Do you use audio assets?
* **Answer**: We use the browser's native **Web Audio API** to synthesize beep chimes programmatically.
* **Why?**: Instead of downloading and playing static `.mp3` files (which can lag over slow networks), we generate a double-beep sound (`C5` pitch to `G5` pitch) directly in-browser using simple math and oscillators.

---

## 🔐 Topic 2: Login System (Authentication)

### Q1: How does the staff (Waiters and Chefs) log in?
* **Answer**: Staff use a **PIN-based authentication** (e.g., entering a 4-digit PIN) rather than standard usernames and passwords.
* **How it works under the hood**:
  1. The staff enters their PIN on the login screen.
  2. The application queries the `waiters` or `chefs` collection in the Firestore database looking for a document where `pin == enteredPin`.
  3. If a match is found, Firestore returns their staff profile.
  4. The profile is saved to our **Zustand store**, which is configured with **session persistence**.

### Q2: How does the login state remain active when refreshing the page?
* **Answer**: We use **Zustand Persist Middleware**. This automatically synchronizes the Zustand login state with the browser's `localStorage`. When the app loads, it reads `localStorage` and automatically logs the staff member back in if a valid token/session exists.

### Q3: Do customers need to register or log in to order?
* **Answer**: **No.** To reduce friction, customers are authenticated dynamically by table number. Scanning a QR code takes them directly to `http://localhost:5173/table/{tableNumber}`, allowing them to order immediately.

---

## 🗄️ Topic 3: Backend & Database Architecture

### Q1: Does your project have a separate backend server?
* **Answer**: **No, it is a Serverless App.**
* **Explanation**: We do not run a traditional backend server (like Node.js, Express, or Django). Instead, we use **Google Firebase** as a **Backend-as-a-Service (BaaS)**. Firebase securely handles database queries, storage, real-time messaging, and data rules directly.

### Q2: What database is used and how is it structured?
* **Answer**: We use **Google Cloud Firestore**, which is a **NoSQL Document Database**. Data is organized into collections of documents (similar to tables and rows, but saved as JSON objects).
* **Key Collections**:
  1. **`orders`**: Stores every customer order (item list, total price, table number, status, assigned waiter, assigned chef, and payment info).
  2. **`tables`**: Tracks whether a table is idle, ordering, waiting for food, billing, or needs waiter help.
  3. **`waiters` / `chefs`**: Stores profiles, PINs, active status, workload counts, and ratings.
  4. **`reviews`**: Holds customer reviews, star ratings, and comments.

### Q3: How does real-time synchronization work in this project?
* **Answer**: We use Firestore's **`onSnapshot` listeners**.
* **How it works**:
  * The frontend applications register a live socket listener to Firestore collections.
  * When a chef updates an order status to `"Ready"` in the kitchen, the document changes in Firestore.
  * Firestore instantly broadcasts this change to the waiter and customer clients over WebSockets.
  * The waiter's dashboard updates immediately in real-time, playing a chime to notify them to collect the food.

---

## 🍽️ Topic 4: Key Business Workflows (How the System Operates)

### Q1: How does the order routing work between Chefs?
* **Answer**: The system uses a **Workload-Balanced Kitchen Load Balancer**. When a customer submits an order, the system calculates the remaining prep time of each active chef and routes the order to the chef who has the lowest work queue.

### Q2: How does the Waiter POS step-by-step wizard work?
* **Answer**: It is a 4-step progressive wizard modal:
  * **Step 1 (Table)**: Waiter selects an available physical table. Free, occupied, and assigned tables are color-coded.
  * **Step 2 (Dishes)**: Waiter adds menu items to the cart. Food thumbnails are dynamically fetched.
  * **Step 3 (Checkout)**: Waiter reviews the bill summary and selects a payment method (*Pay Later*, *Cash*, or *Terminal QR*).
  * **Step 4 (Payment)**: If paying upfront, verifies cash change return or scans screen QR code to simulate instant verification before queueing to cookline.

### Q3: How is customer billing handled?
* **Answer**: When food is delivered, an order remains unpaid. The waiter can click **"Generate Bill"** on the table, opening a billing modal. The waiter selects cash or UPI QR, calculates the change if cash is paid, and prompts the customer to submit a rating/review which is directly posted to the public review stream.
