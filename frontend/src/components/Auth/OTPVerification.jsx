import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, ArrowLeft } from 'lucide-react'
import { verifyOTP, resendOTP } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const OTPVerification = ({ email, onBack }) => {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const { loginUser } = useAuth()

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!otp || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)
      const response = await verifyOTP(email, otp, password)
      loginUser(response.data.token, response.data.user)
      toast.success('Account verified successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setResending(true)
      await resendOTP(email)
      toast.success('OTP resent successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md"
    >
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl p-8">
        <button
          onClick={onBack}
          className="flex items-center text-[#868E96] hover:text-[#60656b] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#E6FBF0] p-3 rounded-full">
              <Shield className="w-8 h-8 text-[#3DD598]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#212529] mb-2">Verify Email</h2>
          <p className="text-[#6C757D]">
            Enter the OTP sent to <span className="text-[#2b2f33] font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#212529] mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-[#212529] text-center text-2xl tracking-widest placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[gray] focus:border-transparent"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Create Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-[#212529] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[gray] focus:border-transparent"
                placeholder="Enter password (min 8 characters)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-[#212529] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[gray] focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3DD598] text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#6C757D] text-sm">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOTP}
              disabled={resending}
              className="text-[#1A7D50] hover:text-[green] font-semibold transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default OTPVerification