# SmartServe Design System (DS)

This document details the complete design system of **SmartServe**, a premium real-time restaurant management platform. It defines the styling structure, design tokens, custom colors, typography, layout components, and motion/interactive guidelines.

---

## 1. Design Philosophy
SmartServe's UI is designed to feel **modern, premium, and dynamic**. The key aesthetics include:
*   **High Contrast & Readability**: Critical for high-pace restaurant environments (Kitchen, Dining Floor).
*   **Glassmorphism & Depth**: Multi-layer panels with smooth blur effects to represent overlay modules.
*   **Role-Specific Accents**: Tailored styling tones to help waiters, chefs, and admins instantly recognize their environment.
*   **Micro-interactions**: Fluid transitions, status indicators, and audio alerts to keep the operation responsive.

---

## 2. Color System
The colors are managed using CSS Custom Properties (Variables) inside `index.css` mapped dynamically to Tailwind CSS utility classes. This supports a seamless **Light Mode** and **Dark Mode** toggle.

### 2.1 CSS Custom Properties (`index.css`)
```css
:root {
  /* Light Theme */
  --background: 0 0% 100%;             /* White */
  --foreground: 222.2 84% 4.9%;        /* Deep Dark Slate */
  --card: 0 0% 100%;                   /* White Card */
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;        /* Dark Gray / Slate Accent */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;          /* Cool Gray */
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;        /* Bright Red */
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  /* Dark Theme */
  --background: 222.2 84% 4.9%;        /* Deep Dark Slate */
  --foreground: 210 40% 98%;           /* Light Gray Text */
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;      /* Slate Gray Card BG */
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;        /* Dark Red */
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### 2.2 System Accents & Meanings
*   **Green (`text-emerald-500`, `bg-emerald-50`)**: Indicates **Completed** orders, active/online waiters, and successful payments.
*   **Amber/Orange (`text-amber-500`, `bg-amber-50`)**: Indicates **Preparing** orders, active break status, and billing requests.
*   **Blue (`text-blue-500`, `bg-blue-50`)**: Represents **New** orders, table assignments, and customer feedback.
*   **Red (`text-rose-500`, `bg-rose-50`)**: Indicates **Cancelled** orders, offline status, or high active kitchen loads.

---

## 3. Typography
SmartServe uses a clean, modern sans-serif typography stack configured in `tailwind.config.js`.

*   **Primary Font Family**: `Poppins` (Google Fonts) for display titles, headings, and key action buttons. It provides a friendly, premium, and clean layout look.
*   **Secondary/Body Font Family**: `Inter` (Google Fonts) for standard UI text, order listings, tables, statistics, and logs. It provides maximum density and high readability at small sizes.
*   **Font Weights**:
    *   `Light` (300) - Used for metadata labels.
    *   `Regular` (400) - Default body copy and descriptions.
    *   `Medium` (500) - Subheadings, navigation text, and key item lists.
    *   `SemiBold` (600) - Component headers, cards titles, and action triggers.
    *   `Bold` (700) - Key stats numbers, main titles.

---

## 4. Layout & Spacing System
SmartServe supports four target devices/views, designed with specific spacing parameters:

1.  **Customer UI**: Fully responsive, prioritizing mobile-first viewport styling. Layout fits exactly in single-hand reach, using large floating action buttons.
2.  **Waiter Mobile App**: Heavy use of a bottom tab bar layout, compact card components, and swipe-to-update micro-actions.
3.  **Chef Desktop Layout**: A multi-column Kanban board structure optimized for medium-to-large tablets or wall monitors.
4.  **Admin Portal Panel**: Desktop-first layout containing a collapsible sidebar navigation menu, wide data tables, and dynamic grid layouts for stats widgets.

### Spacing Guidelines
*   **Grid Layouts**: `gap-4` (1rem / 16px) is the standard spacing gap for lists and dashboard grids.
*   **Card Padding**: `p-4` or `p-6` is used to separate internal card content cleanly.
*   **Border Radius**:
    *   `rounded-sm` (4px) - Used for form elements.
    *   `rounded-md` (6px) - Standard button radius.
    *   `rounded-lg` (8px / `var(--radius)`) - Standard card container border radius.

---

## 5. UI Components & Glassmorphism Spec
Many modal overlays and floating widgets utilize glassmorphism classes:

```css
.glassmorphism-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glassmorphism-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

---

## 6. Motion & Audio Guidelines
Interactions are enriched with:
1.  **Framer Motion transitions**:
    *   `hover: scale-102` for interactive menu items and active order cards.
    *   `layoutId` animations on transitions between tabs (e.g., active orders to preparing orders).
    *   Smooth page entry fade-ins (`y: [20, 0]`, `opacity: [0, 1]`).
2.  **Audio Chimes**:
    *   Synthesized using the **Web Audio API** (avoiding large static audio file downloads).
    *   Generates a double beep chime (C5 at 523.25Hz followed by G5 at 783.99Hz) dynamically when new orders are assigned to a waiter or when a chef marks an order as ready.
