import { createContext, useState, useContext } from 'react' 
import { getChatHistory, createNewChat as createNewChatAPI, getChatById } from '../services/api' 

const ChatContext = createContext() 

export const useChat = () => {
  const context = useContext(ChatContext) 
  if (!context) {
    throw new Error('useChat must be used within ChatProvider') 
  }
  return context 
} 

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]) 
  const [currentChat, setCurrentChat] = useState(null) 
  const [messages, setMessages] = useState([]) 
  const [loading, setLoading] = useState(false) 

  const fetchChatHistory = async () => {
    try {
      setLoading(true) 
      const response = await getChatHistory() 
      setChats(response.data.chats) 
    } catch (error) {
      console.error('Failed to fetch chat history:', error) 
    } finally {
      setLoading(false) 
    }
  } 

  const createNewChat = async () => {
    try {
      const response = await createNewChatAPI() 
      const newChat = response.data.chat 
      setChats([newChat, ...chats]) 
      setCurrentChat(newChat) 
      setMessages([]) 
      return newChat 
    } catch (error) {
      console.error('Failed to create new chat:', error) 
      throw error 
    }
  } 

  const selectChat = async (chat) => {
    try {
      setLoading(true) 
      const response = await getChatById(chat.id) 
      const fullChat = response.data.chat 
      setCurrentChat(fullChat) 
      setMessages(fullChat.messages || []) 
    } catch (error) {
      console.error('Failed to load chat:', error) 
      setCurrentChat(chat) 
      setMessages([]) 
    } finally {
      setLoading(false) 
    }
  } 

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]) 
  } 

  const updateLastMessage = (content) => {
    setMessages((prev) => {
      const newMessages = [...prev] 
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content,
        } 
      }
      return newMessages 
    }) 
  } 

  const clearCurrentChat = () => {
    setCurrentChat(null) 
    setMessages([]) 
  } 

  const removeChatFromHistory = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId)) 
    if (currentChat?.id === chatId) {
      clearCurrentChat() 
    }
  } 

  const updateCurrentChatPDF = (pdfFileName, pdfUploadedAt) => {
    if (currentChat) {
      setCurrentChat({
        ...currentChat,
        pdfFileName,
        pdfUploadedAt,
      }) 
    }
  } 

  const value = {
    chats,
    currentChat,
    messages,
    loading,
    fetchChatHistory,
    createNewChat,
    selectChat,
    addMessage,
    updateLastMessage,
    clearCurrentChat,
    removeChatFromHistory,
    updateCurrentChatPDF,
    setMessages,
  } 

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider> 
} 
