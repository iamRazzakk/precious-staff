import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { PasswordInput, FieldWithLabel, PrimaryButton } from '@/components/common'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!newPw || !confirm) {
      setError('Please fill in all fields')
      return
    }
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPw !== confirm) {
      setError('Passwords do not match')
      return
    }
    setSuccess(true)
    setTimeout(() => navigate('/login'), 1500)
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-10">
          <div className="w-20 h-20 rounded-full bg-success-light inline-flex items-center justify-center text-success mb-5">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-0 mb-2">
            Password reset!
          </h1>
          <p className="text-sm text-text-secondary m-0">
            Redirecting you to login...
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-bold text-text-primary mt-0 mb-2">
        Set new password
      </h1>
      <p className="text-sm text-text-secondary mt-0 mb-7 leading-[1.6]">
        Pick a strong password to secure your account.
      </p>

      <form onSubmit={handleSubmit}>
        <FieldWithLabel label="New Password">
          <PasswordInput value={newPw} onChange={setNewPw} placeholder="At least 8 characters" />
        </FieldWithLabel>
        <FieldWithLabel label="Confirm Password">
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Re-enter password" />
        </FieldWithLabel>

        {error && (
          <div className="px-3.5 py-2.5 rounded-[10px] bg-danger-light text-danger-text text-[13px] font-medium flex items-center gap-2 mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <PrimaryButton type="submit" label="Reset password" fullWidth />
      </form>
    </AuthLayout>
  )
}

export default ResetPasswordPage
