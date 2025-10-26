import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock } from 'lucide-react'
import { login } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Login = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const response = await login(email, password)
      loginUser(response.data.token, response.data.user)
      toast.success('Login successful!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
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
              <LogIn className="w-8 h-8 text-[#3DD598]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#212529] mb-2">Welcome Back</h2>
          <p className="text-[#6C757D]">Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#3DD598]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-1 focus:ring-[gray] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#3DD598]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-1 focus:ring-[gray] focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3DD598] to-[#50D890] text-[#FFFFFF] py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#6C757D]">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-#1A7D50 hover:text-[#166843] font-semibold transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Login