# JS Mart Admin Dashboard

JS Mart Admin is a powerful, modern, and highly interactive administrative panel built with **Next.js 16**, **Tailwind CSS 4**, and **Framer Motion**. It provides a comprehensive solution for managing a grocery e-commerce catalog, inventory, orders, and business analytics.

## ✨ Features

- **📊 Advanced Analytics**: Real-time sales trends, revenue reports, and customer insights using Recharts.
- **📦 Inventory Management**: Track stock levels, set minimum thresholds, and manage stock adjustments.
- **🛒 Product Management**: Full CRUD operations for products with image upload support and SKU generation.
- **🏷️ Category System**: Organize products into hierarchical categories and sub-categories.
- **🧾 Order Tracking**: Monitor customer orders, track fulfillment status, and export order data.
- **👥 Customer Management**: View customer profiles, order history, and spending patterns.
- **📱 Responsive UI**: Fully optimized for desktop, tablet, and mobile screens.
- **🎨 Premium Design**: Modern aesthetics with glassmorphism, micro-animations, and a curated color palette (Emerald/Slate).

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Logic**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Utilities**: `clsx`, `tailwind-merge`

## 📁 Professional Project Structure

This project uses a "View-Entry" pattern to avoid the "multiple page.jsx" tab confusion in editors. Each route has a uniquely named logic file.

```text
src/app/
├── (Dashboard)        → DashboardView.jsx
├── analytics/         → AnalyticsView.jsx
├── categories/        → CategoriesView.jsx
├── orders/            → OrdersView.jsx
├── inventory/         → InventoryView.jsx
├── products/
│   ├── (List)         → ProductsList.jsx
│   └── add/           → AddProductForm.jsx
└── users/customers/   → CustomersView.jsx
```

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the admin panel.

### 3. Build for Production
```bash
npm run build
npm start
```

## 💾 Data Management
The dashboard uses a hybrid data approach:
1. **Mock Data**: Initial data served from `src/data/mock.js`.
2. **Local Persistence**: New products and changes are persisted to `localStorage` via utilities in `src/lib/products.js`, allowing for a fully functional demo without a backend.

## 📄 License
This project is proprietary for the JS Mart Admin Dashboard.

# Project Folder Structure

I have reorganized the project to follow Next.js App Router best practices.

## Overview

- **`src/app`**: Contains **only** routing logic (`page.jsx`, `layout.jsx`). Components here are minimal wrappers.
- **`src/components`**: Contains all UI logic and presentation components.
  - **`layout`**: Application shell (Header, Sidebar).
  - **`providers`**: Context providers (AuthProvider).
  - **`features`**: Feature-specific components grouped by domain.

## Detailed Structure

```
src/
├── app/                  # Route definitions
│   ├── (auth)/           # Authentication routes
│   └── (main)/           # Main application routes
│       ├── dashboard/    # /dashboard
│       ├── products/     # /products
│       ├── orders/       # /orders
│       └── ...
│
├── components/           # Reusable components
│   ├── layout/           # Global layout components
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── providers/        # Context Providers
│   │   └── AuthProvider.jsx
│   │
│   └── features/         # Feature-specific logic
│       ├── dashboard/    # Dashboard widgets & views
│       │   ├── DashboardView.jsx
│       │   ├── SalesChart.jsx
│       │   └── StatsCard.jsx
│       │
│       ├── products/     # Product management
│       │   ├── ProductsList.jsx
│       │   └── AddProductForm.jsx
│       │
│       ├── orders/       # Order management
│       │   ├── OrdersView.jsx
│       │   └── OrderReceipt.jsx
│       │
│       └── ... (analytics, customers, inventory, etc.)
```

## Benefits

1.  **Separation of Concerns**: Routing is separate from UI logic.
2.  **Maintainability**: Features are self-contained in `components/features`.
3.  **Scalability**: Easy to add new features without cluttering the route tree.
4.  **Reusability**: Components can be imported and reused across pages if needed.

## How to Import

Use the absolute path alias `@/` to import components:

```javascript
import { Header } from "@/components/layout/Header";
import ProductsList from "@/components/features/products/ProductsList";
```
