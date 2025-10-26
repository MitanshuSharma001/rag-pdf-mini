import { createContext, useState, useContext, useEffect } from 'react' 
import { getProfile } from '../services/api' 

const AuthContext = createContext() 

export const useAuth = () => {
  const context = useContext(AuthContext) 
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider') 
  }
  return context 
} 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null) 
  const [loading, setLoading] = useState(true) 
  const [token, setToken] = useState(localStorage.getItem('token')) 

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await getProfile() 
          setUser(response.data.user) 
        } catch (error) {
          console.error('Auth init error:', error) 
          localStorage.removeItem('token') 
          setToken(null) 
        }
      }
      setLoading(false) 
    } 

    initAuth() 
  }, [token]) 

  const loginUser = (newToken, userData) => {
    localStorage.setItem('token', newToken) 
    setToken(newToken) 
    setUser(userData) 
  } 

  const logoutUser = () => {
    localStorage.removeItem('token') 
    setToken(null) 
    setUser(null) 
  } 

  const value = {
    user,
    token,
    loading,
    loginUser,
    logoutUser,
    isAuthenticated: !!user,
  } 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> 
} 