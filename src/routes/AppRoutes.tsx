import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Dashboard pages
import ClockInOutPage from '@/pages/clock-in-out/ClockInOutPage'
import MySchedulePage from '@/pages/my-schedule/MySchedulePage'
import TaskChecklistPage from '@/pages/task-checklist/TaskChecklistPage'
import HoursWorkedPage from '@/pages/hours-worked/HoursWorkedPage'
import MyProfilePage from '@/pages/my-profile/MyProfilePage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import ChatPage from '@/pages/chat/ChatPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Onboarding gate — authed but pre-onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarded={false}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - nested under DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/clock-in-out" element={<ClockInOutPage />} />
        <Route path="/my-schedule" element={<MySchedulePage />} />
        <Route path="/task-checklist" element={<TaskChecklistPage />} />
        <Route path="/hours-worked" element={<HoursWorkedPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Defaults */}
      <Route path="/" element={<Navigate to="/clock-in-out" replace />} />
      <Route path="*" element={<Navigate to="/clock-in-out" replace />} />
    </Routes>
  )
}

export default AppRoutes
