# Precious Admin Dashboard

A production-ready admin dashboard built with React 18, TypeScript, Tailwind CSS, and Ant Design.

## Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Ant Design 5** - UI component library (Tables, Forms, Modals)
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (opens http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Login Credentials

Any email / password combo works — auth is mocked for demo purposes.

## Project Structure

```
src/
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable components
│   ├── auth/              # Auth layout, OTP input
│   ├── common/            # Buttons, Cards, Badges, Toasts
│   ├── layout/            # Sidebar, TopBar, DashboardLayout
│   └── modals/            # ConfirmDialog, all details/edit modals
├── context/               # React contexts (Auth, Notifications, Toast)
├── data/                  # Mock seed data (users, plans, tickets...)
├── hooks/                 # Custom hooks (useCountdown, useToast)
├── pages/                 # Route pages
│   ├── auth/              # Login, Forgot, OTP, Reset
│   ├── dashboard/
│   ├── users/
│   ├── plans/
│   ├── community/
│   ├── interest/
│   ├── subscriptions/
│   ├── revenue/
│   ├── safety/
│   ├── broadcast/
│   ├── support/
│   ├── settings/
│   └── notifications/
├── routes/                # Route definitions & protected routes
├── styles/                # Global CSS, theme tokens
├── types/                 # TypeScript interfaces & types
├── utils/                 # Helpers (formatters, colors)
├── App.tsx
└── main.tsx
```

## Features

- **Authentication flow** - Login, Forgot Password, OTP Verification, Reset Password
- **Dashboard** - KPI cards, growth charts, safety triage preview
- **User Management** - Table with details modal, lock/delete actions
- **Plans** - Meetup management with roster stacks
- **Community** - 5-tab details (Overview/Members/Group/Competitions/Scoreboard)
- **Subscriptions** - CRUD with features & limits, hide/edit dialogs
- **Revenue** - Area chart, subscriber table with plan filters
- **Interest** - Drag & drop image upload, emoji picker
- **Safety Triage** - Report details, history timeline, block flow
- **Broadcast** - Multi-channel notifications with live preview
- **Support** - Ticketing system with chat-thread UI
- **Settings** - 6 sub-sections including rich-text editors
- **Notifications** - Admin inbox with filters, read states

## Customization

- **Colors** are in `src/utils/colors.ts` and `tailwind.config.js`
- **Ant Design theme** is configured in `src/App.tsx`
- **Mock data** lives in `src/data/` — replace with real API calls
