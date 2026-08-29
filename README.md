# Pillar 2: Inventory & Stock Management Dashboard

A secure, production-grade Next.js dashboard application built for the **React Frontend Engineer Technical Assessment (Pillar 2 - Functional Logic Test)**. This project implements real-time inventory management, Zustand global state management with local persistence, Edge-level NextAuth.js v5 route protection, role-based access controls, and a multi-outcome checkout simulator.

---

## 🚀 Key Features

### 🔐 Authentication & Edge Security
- **Real Google OAuth Login**: Fully configured via NextAuth.js (Auth.js) v5. Users can sign in using their official Google accounts.
- **Visual Credentials Panel**: Includes preconfigured demo cards for Administrator and Manager roles with copy-to-clipboard functionality for easy testing.
- **Empty-by-Default Inputs**: The login form starts completely empty on initial load, ensuring credentials must be manually entered or pasted.
- **Show/Hide Password Toggle**: Secure password visibility toggle with interactive eye icons inside the input container.
- **Edge Middleware Route Protection**: Uses Next.js Edge-level `middleware.ts` to block unauthenticated users from accessing `/dashboard` and sub-routes, redirecting them to `/login`.

### 📦 Inventory & State Management
- **Zustand Global Cart Store**: Synced optimistically across components to update cart badge counts instantly in the navbar on click without waiting for API responses.
- **Cart Persistence**: Configured using Zustand's `persist` middleware, storing cart states inside `localStorage` to survive page refreshes.
- **Figma Stock Status Rules**:
  - `stock = 0`: Displays a red warning status dot, shows an "Out of Stock" badge on the card, and disables the Add to Cart button.
  - `0 < stock < 5`: Displays a yellow/amber warning status dot and a "Low Stock" badge. Add button remains enabled.
  - `stock >= 5`: Displays a green status dot with a **normal card display (no badge shown)**.
  - Quantities inside the cart are capped to prevent users from adding more items than are available in stock.

### 💳 Interactive Checkout Simulator
- **Button Loading State**: Disables checkout actions and displays a spinning loader on the checkout button during submission.
- **Checkout Action Endpoint**: POSTs cart items to the mock API to validate stock and decrement quantities in the mock database.
- **Payment Failure Simulator**: Includes a simulator checkbox inside the cart drawer. When checked, it throws a payment processing failure, displaying a custom warning toast notification with a clickable **"Retry Checkout"** action button.
- **Checkout Success**: Triggers a success toast notification and automatically clears the cart.

### 🛡️ Role-Based Access Control (RBAC)
- **Admin Role (`admin`)**: Displays inline "Adjust Stock" input fields on product cards to restock items directly in the database.
- **Manager Role (`manager`)**: Hides management controls, displaying products in a read-only catalog state.

---

## 🛠️ Tech Stack

- **Framework**: Next.js v16.3 (using App Router architecture)
- **Language**: TypeScript (Strict mode - **zero `any` types** in the codebase)
- **Styling**: Tailwind CSS v4 + PostCSS
- **State Management**: Zustand v5
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Toasts**: React Hot Toast

---

## 📂 Project Structure

```
react-frontend-functional-assessment/
├── public/
│   └── assets/images/              # High-quality product mockup image assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth API endpoints
│   │   │   └── products/route.ts            # Mock in-memory products & stock database
│   │   ├── dashboard/
│   │   │   ├── DashboardClient.tsx          # Main interactive dashboard UI
│   │   │   └── page.tsx                     # Server component loading session
│   │   ├── login/
│   │   │   └── page.tsx                     # Login card with providers & credential copy helpers
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                         # Redirect page to dashboard
│   ├── store/
│   │   └── useCartStore.ts                  # Zustand persistent store
│   ├── types/
│   │   ├── index.ts                         # Custom type interfaces
│   │   └── next-auth.d.ts                   # NextAuth session role extensions
│   ├── auth.ts                              # NextAuth configuration
│   └── middleware.ts                        # Edge-level middleware route guard
```

---

## ⚙️ Installation & Development Setup

### 1. Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
# Auth.js / NextAuth v5 Configuration
# Generate a secure secret with 'openssl rand -base64 32'
AUTH_SECRET="your_auth_secret_here"

# Google OAuth Client Credentials
# Created via Google Cloud Console for technical assessment review
AUTH_GOOGLE_ID="your_google_client_id_here"
AUTH_GOOGLE_SECRET="your_google_client_secret_here"

# Base Application URL
NEXTAUTH_URL="http://localhost:3000"
```
*Note: An `.env.example` has been committed to the repository for reference. The Authorized Redirect URI registered in the Google Cloud Console must be exactly `http://localhost:3000/api/auth/callback/google`.*

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build Project
```bash
npm run build
```

---

## ⚖️ Key Architectural Decisions & Trade-offs

### State Management: Zustand vs. Redux
We chose **Zustand** instead of Redux/Redux Toolkit for state management because:
- **Minimal Boilerplate**: Zustand does not require action creators, reducers, dispatchers, or store providers/wrappers. It can be set up in just a few lines of code.
- **Bundle Size**: Zustand is extremely lightweight (~1.5 KB minified/gzipped compared to RTK's ~30 KB).
- **No Context Providers**: It avoids React Context re-renders by allowing components to select specific slices of state.
- **Easy Persistence Middleware**: Out-of-the-box local storage synchronization is achieved seamlessly via Zustand's `persist` middleware.

### Hydration Mismatch Mitigation
Because Zustand stores data in `localStorage`, the client-side cart count and the server-rendered initial count (0) would normally differ, throwing hydration warnings. We resolved this by using a state hydration flag (`hasHydrated`) in the client, ensuring client-persisted values only render after client hydration occurs, yielding zero console warnings.

### In-Memory Stock Database
The mock product API `/api/products` stores catalog details in-memory on the Node server. This allows real-time stock decrementing upon checking out and immediate reflection for other sessions/roles, providing a true full-stack behavior for the UI.

---

## 🎨 Design Notes & Figma Deviations

- **In Stock / Normal Display**: According to the Figma state diagrams, items with `stock >= 5` have a "Normal display · No badge shown". Therefore, the green "In Stock" badge is hidden in the product list grid to match the state rules perfectly.
- **Visual Status Dots**: Added colored status dot indicators (Red for Out of Stock, Amber for Low Stock, Green for In Stock) directly next to the stock count inside the product cards to visually represent the inventory states.

---

## ⚠️ Known Limitations

- **Volatile Mock Storage**: Since the products stock database is mocked in-memory, the stock values will reset back to the default values when the Next.js development server is restarted or rebuilt. (We added an inline Admin "Adjust Stock" tool for testing purposes to quickly update values).

---

## 🎁 Completed Bonus Challenges

1. **Edge Middleware (`middleware.ts`)**: Used NextAuth middleware for Edge-level route protection.
2. **Role-Based Access Control (RBAC)**: Added `admin` and `manager` role distinctions to hide/show stock adjustment actions.
3. **Performance - Code Splitting**: Implemented `next/dynamic` imports for heavy interactive dashboard modules.
4. **Cart Persistence**: Configured Zustand persistence store to survive page reloads.

---

## 🔗 Submission Links

- **GitHub Repository**: [GitHub Link](https://github.com/shahriar-crea/react-frontend-engineer-assessment)
- **Live Demo URL**: [Vercel Deployment](https://react-frontend-functional-assessment.vercel.app)
