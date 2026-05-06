import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AdminUser {
  name: string
  email: string
  avatar: string
  role: string
}

interface AuthContextValue {
  user: AdminUser | null
  isAuthenticated: boolean
  hasOnboarded: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  completeOnboarding: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ONBOARDING_KEY = 'precious-staff:hasOnboarded'

const DEFAULT_USER: AdminUser = {
  name: 'Maria Santos',
  email: 'maria.santos@preciouscare.com',
  avatar: 'https://i.pravatar.cc/120?img=47',
  role: 'Certified Nursing Assistant (CNA) — Precious Care Providers',
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(ONBOARDING_KEY) === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ONBOARDING_KEY, hasOnboarded ? 'true' : 'false')
  }, [hasOnboarded])

  const login = async (_email: string, _password: string): Promise<void> => {
    // Mock authentication — accepts any email/password
    await new Promise((resolve) => setTimeout(resolve, 600))
    setUser(DEFAULT_USER)
  }

  const logout = () => {
    setUser(null)
  }

  const completeOnboarding = () => {
    setHasOnboarded(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hasOnboarded,
        login,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
