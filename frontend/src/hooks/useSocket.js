import { useEffect, useState } from 'react' 
import { getSocket } from '../services/socket' 

export const useSocket = () => {
  const [socket, setSocket] = useState(null) 
  const [connected, setConnected] = useState(false) 

  useEffect(() => {
    const socketInstance = getSocket() 
    setSocket(socketInstance) 

    socketInstance.on('connect', () => {
      setConnected(true) 
    }) 

    socketInstance.on('disconnect', () => {
      setConnected(false) 
    }) 

    return () => {
      socketInstance.off('connect') 
      socketInstance.off('disconnect') 
    } 
  }, []) 

  return { socket, connected } 
} 