import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, LogOut, Loader2 } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'
import ChatItem from './ChatItem'

const ChatHistory = () => {
  const { chats, loading, fetchChatHistory, createNewChat, currentChat, selectChat } = useChat()
  const { logoutUser, user } = useAuth()
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchChatHistory()
  }, [])

  const handleNewChat = async () => {
    try {
      setCreating(true)
      await createNewChat()
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="w-80 bg-[#F8F9FA] border-r border-slate-700 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#212529]">Chat History</h2>
          <button
            onClick={logoutUser}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#aeffae] rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleNewChat}
          disabled={creating}
          className="w-full flex items-center justify-center px-4 py-3 bg-[#3DD598] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              New Chat
            </>
          )}
        </button>
        {user && (
          <p className="text-xs text-[#868E96] mt-2 text-center truncate">
            {user.email}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No chats yet</p>
            <p className="text-slate-500 text-xs mt-1">Create a new chat to get started</p>
          </div>
        ) : (
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ChatItem
                  chat={chat}
                  isActive={currentChat?.id === chat.id}
                  onClick={() => selectChat(chat)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default ChatHistory