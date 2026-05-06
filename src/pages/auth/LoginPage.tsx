import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, AlertCircle } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { PillInput, PasswordInput, FieldWithLabel, PrimaryButton } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { colors } from '@/utils/colors'

const LoginPage = () => {
  const { login, hasOnboarded } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@goodniva.com')
  const [password, setPassword] = useState('••••••••')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate(hasOnboarded ? '/clock-in-out' : '/onboarding')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-bold text-text-primary mt-0 mb-2">
        Welcome back
      </h1>
      <p className="text-sm text-text-secondary mt-0 mb-7">
        Sign in to your stuff dashboard to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <FieldWithLabel label="Email Address">
          <PillInput
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            iconLeft={Mail}
          />
        </FieldWithLabel>
        <FieldWithLabel label="Password">
          <PasswordInput value={password} onChange={setPassword} placeholder="Enter password" />
        </FieldWithLabel>

        <div className="flex justify-between items-center mb-5">
          <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: colors.primary }}
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-[13px] font-semibold text-primary no-underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="px-3.5 py-2.5 rounded-[10px] bg-danger-light text-danger-text text-[13px] font-medium flex items-center gap-2 mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <PrimaryButton
          type="submit"
          label={loading ? 'Signing in...' : 'Sign In'}
          disabled={loading}
          fullWidth
        />
      </form>

      <p className="mt-6 text-[13px] text-text-muted text-center">
        Demo: any email / password works
      </p>
    </AuthLayout>
  )
}

export default LoginPage
