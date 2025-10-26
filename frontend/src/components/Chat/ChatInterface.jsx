import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, AlertCircle, Clock } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import FileUpload from './FileUpload'
import toast from 'react-hot-toast'

const ChatInterface = () => {
  const { currentChat, addMessage, messages, updateCurrentChatPDF } = useChat()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.on('status', (data) => {
      setIsProcessing(true)
      setStatusMessage(data.message)
    })
    socket.on('waitfor',async(data)=>{
      // if (data.wait) {
        
      // }
      toast.loading(`Wait for around ${data.wait=='<1'?'<1 minute':`${data.wait} minutes`}`,{id:'load1'})
      await new Promise((resolve, reject) =>setTimeout(()=>{resolve(toast.dismiss('load1'))},4000))
    })

    socket.on('upload-complete', (data) => {
      setIsProcessing(false)
      setStatusMessage('')
      updateCurrentChatPDF(data.pdfFileName, data.pdfUploadedAt)
      toast.success(data.message)
    })

    socket.on('message-response', (data) => {
      setIsProcessing(false)
      setStatusMessage('')
      // Add assistant message 
      addMessage({ role: 'assistant', content: data.response })
    })

    socket.on('error', (data) => {
      setIsProcessing(false)
      setStatusMessage('')
      if (data.type === 'chromadb_down') {
        toast.error('ChromaDB is down')
      } else {
        toast.error(data.message)
      }
    })

    return () => {
      socket.off('status')
      socket.off('upload-complete')
      socket.off('message-response')
      socket.off('error')
    }
  }, [socket, addMessage, updateCurrentChatPDF])

  const formatUploadTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FFFFFF]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-[#F8F9FA] p-8 rounded-2xl shadow-xl border-2 border-[#DEE2E6]" style={{boxShadow:'0 4px 12px rgba(0, 0, 0, 0.05)'}}>
            <FileText className="w-16 h-16 text-[#3DD598] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#212529] mb-2">No Chat Selected</h2>
            <p className="text-[#6C757D]">Create a new chat to get started</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (currentChat.status === 'failed') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-darker to-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-red-900/20 border border-red-500 p-8 rounded-2xl shadow-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Chat Failed</h2>
            <p className="text-slate-400">This chat has encountered an error. Please create a new chat.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const showFileUpload = !currentChat.pdfFileName

  return (
    <div className="flex-1 flex flex-col bg-[#FFFFFF]">
      <div className="border-b border-slate-700 bg-[#E6FBF0] backdrop-blur-sm px-6 py-4">
        <h2 className="text-xl font-semibold text-[#1A7D50]">{currentChat.title}</h2>
        {currentChat.pdfFileName && (
          <div className="flex items-center gap-2 mt-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-[#1A7D50]">{currentChat.pdfFileName}</span>
            {currentChat.pdfUploadedAt && (
              <>
                <span className="text-slate-600">•</span>
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {formatUploadTime(currentChat.pdfUploadedAt)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {showFileUpload ? (
        <FileUpload 
          currentChat={currentChat} 
          userId={user.id}
          isProcessing={isProcessing}
          statusMessage={statusMessage}
        />
      ) : (
        <>
          <MessageList messages={messages} isProcessing={isProcessing} statusMessage={statusMessage} />
          <MessageInput 
            currentChat={currentChat} 
            userId={user.id}
            isProcessing={isProcessing}
            messageCount={currentChat.messageCount}
          />
        </>
      )}
    </div>
  )
}

export default ChatInterface