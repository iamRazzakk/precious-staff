import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { PillInput, FieldWithLabel, PrimaryButton } from '@/components/common'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    navigate('/verify-otp', { state: { email } })
  }

  return (
    <AuthLayout>
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary no-underline mb-4"
      >
        <ArrowLeft size={14} /> Back to login
      </Link>

      <h1 className="text-[28px] font-bold text-text-primary mt-0 mb-2">
        Forgot your password?
      </h1>
      <p className="text-sm text-text-secondary mt-0 mb-7 leading-[1.6]">
        No worries. Enter your email and we'll send you a 4-digit code to reset your password.
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

        <div className="mt-5">
          <PrimaryButton
            type="submit"
            label={loading ? 'Sending...' : 'Send reset code'}
            disabled={loading || !email.trim()}
            fullWidth
          />
        </div>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
