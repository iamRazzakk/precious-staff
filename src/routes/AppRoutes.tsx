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
import DailyTasksPage from '@/pages/daily-tasks/DailyTasksPage'
import HoursWorkedPage from '@/pages/hours-worked/HoursWorkedPage'
import MyProfilePage from '@/pages/my-profile/MyProfilePage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

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
        <Route path="/daily-tasks" element={<DailyTasksPage />} />
        <Route path="/hours-worked" element={<HoursWorkedPage />} />
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
