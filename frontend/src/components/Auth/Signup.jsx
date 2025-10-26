import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Mail } from 'lucide-react'
import { signup } from '../../services/api'
import toast from 'react-hot-toast'

const Signup = ({ onSwitchToLogin, onOTPSent }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email')
      return
    }

    try {
      setLoading(true)
      await signup(email)
      toast.success('OTP sent to your email!')
      onOTPSent(email)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md"
    >
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#E6FBF0] p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-[#3DD598]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#212529] mb-2">Create Account</h2>
          <p className="text-[#6C757D]">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#212529] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#3DD598]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-1 focus:ring-[#DEE2E6] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              We'll send you an OTP to verify your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3DD598] to-[#50D890] text-[#FFFFFF] py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#6C757D]">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#1A7D50] hover:text-[#145f3d] font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Signup