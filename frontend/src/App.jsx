import { useState,useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import axios from 'axios';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import OTPVerification from './components/Auth/OTPVerification';
import ChatHistory from './components/Sidebar/ChatHistory';
import ChatInterface from './components/Chat/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetch2= async () => {
      await axios.get('https://cjgwfk6h-6898.inc1.devtunnels.ms/api/health')
    }
    fetch2()
  })
  

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <Login key="login" onSwitchToSignup={() => setView('signup')} />
        )}
        {view === 'signup' && (
          <Signup
            key="signup"
            onSwitchToLogin={() => setView('login')}
            onOTPSent={(userEmail) => {
              setEmail(userEmail);
              setView('otp');
            }}
          />
        )}
        {view === 'otp' && (
          <OTPVerification
            key="otp"
            email={email}
            onBack={() => setView('signup')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatPage = () => {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <ChatHistory />
      <ChatInterface />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-[gray] text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-[gray] text-xl">Loading...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/chat" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
          <Toaster
  position="top-right"
  toastOptions={{
    
    style: {
      background: '#FFFFFF',
      color: '#212529',
      border: '1px solid #DEE2E6',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    
   
    success: {
      style: {
        background: 'linear-gradient(to right, #3DD598, #50D890)',
        color: '#FFFFFF', 
        border: 'none',
      },
      iconTheme: {
        primary: '#FFFFFF',   
        secondary: '#3DD598',
      },
    },

    error: {
      style: {
        background: '#FFF5F5', 
        color: '#E03131',     
        border: '1px solid #E03131',
      },
      iconTheme: {
        primary: '#E03131',   // Red icon
        secondary: '#FFF5F5', 
      },
    },
    
    loading: {
      style: {
        background: '#E7F5FF', // Very pale blue
        color: '#1A7D50',     
        border: '1px solid #3DD598', 
      },
      iconTheme: {
        primary: '#3DD598',  
        secondary: '#DEE2E6',
      },
    },
  }}
/>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;