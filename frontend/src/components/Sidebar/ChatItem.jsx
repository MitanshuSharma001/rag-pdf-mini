import { useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { deleteChat } from '../../services/api'
import { useChat } from '../../context/ChatContext'
import { formatDate, truncateText } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ChatItem = ({ chat, isActive, onClick }) => {
  const [deleting, setDeleting] = useState(false)
  const { removeChatFromHistory } = useChat()

  const handleDelete = async (e) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this chat?')) {
      return
    }

    try {
      setDeleting(true)
      await deleteChat(chat.id)
      removeChatFromHistory(chat.id)
      toast.success('Chat deleted successfully')
    } catch (error) {
      toast.error('Failed to delete chat')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-[#E6FBF0] border border-primary/30'
          : 'hover:bg-[#E6FBF0] border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={` font-medium truncate ${isActive ?'text-[#1A7D50]':'text-[#212529]'}`}>
              {truncateText(chat.title, 30)}
            </h3>
            {chat.status === 'failed' && (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
          {chat.firstMessage && (
            <p className="text-slate-400 text-xs mt-1 truncate">
              {truncateText(chat.firstMessage, 50)}
            </p>
          )}
          <p className={` text-xs mt-1 ${isActive?'text-slate-500':'text-[#868E96'}`}>
            {formatDate(chat.createdAt)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-400 hover:bg-[#087d08] rounded disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ChatItem