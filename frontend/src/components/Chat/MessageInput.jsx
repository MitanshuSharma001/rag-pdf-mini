import { useState } from 'react'
import { Send } from 'lucide-react'
import { useSocket } from '../../hooks/useSocket'
import { useChat } from '../../context/ChatContext'
import toast from 'react-hot-toast'

const MessageInput = ({ currentChat, userId, isProcessing, messageCount }) => {
  const [message, setMessage] = useState('')
  const { socket } = useSocket()
  const { addMessage } = useChat()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (messageCount >= 40) {
      toast.error('Message limit reached for this chat (maximum 40 messages)')
      return
    }

    if (isProcessing) {
      toast.error('Please wait for the current operation to complete')
      return
    }

    if (socket) {
      // Add user message immediately to UI
      addMessage({ role: 'user', content: message.trim() })
      
      // Send to backend
      socket.emit('send-message', {
        chatId: currentChat.id,
        userId: userId,
        message: message.trim()
      })
      
      setMessage('')
    }
  }

  return (
    <div className="border-t border-[#E9ECEF] bg-[#FFFFFF] backdrop-blur-sm px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isProcessing}
          placeholder={messageCount >= 40 ? "Message limit reached" : "Type your question..."}
          className="flex-1 px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder-[#868E96] focus:outline-none focus:ring-1 focus:ring-[gray] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        />
        <button
          type="submit"
          disabled={isProcessing || !message.trim() || messageCount >= 40}
          className="px-6 py-3 bg-[green] text-[#3DD598] rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      {messageCount >= 35 && messageCount < 40 && (
        <p className="text-xs text-yellow-500 mt-2">
          Warning: {40 - messageCount} messages remaining
        </p>
      )}
    </div>
  )
}

export default MessageInput