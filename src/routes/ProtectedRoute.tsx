import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireOnboarded?: boolean
}

const ProtectedRoute = ({ children, requireOnboarded = true }: ProtectedRouteProps) => {
  const { isAuthenticated, hasOnboarded } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireOnboarded && !hasOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
