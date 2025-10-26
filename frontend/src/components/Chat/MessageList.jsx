import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bot, Loader2 } from 'lucide-react'

const MessageList = ({ messages, isProcessing, statusMessage }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isProcessing])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-[#3DD598]' 
                    : 'bg-slate-700'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-[#FFFFFF]" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: message.role === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#3DD598] to-[#50D890] text-white'
                    : 'bg-[#F1F3F5] text-[#212529]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {isProcessing && statusMessage && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex justify-start"
          >
            <div className="flex items-start max-w-3xl">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#F1F3F5] text-[#212529] flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>{statusMessage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList