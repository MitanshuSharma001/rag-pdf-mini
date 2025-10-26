export const formatDate = (dateString) => {
  const date = new Date(dateString) 
  const now = new Date() 
  const diff = now - date 
  const seconds = Math.floor(diff / 1000) 
  const minutes = Math.floor(seconds / 60) 
  const hours = Math.floor(minutes / 60) 
  const days = Math.floor(hours / 24) 

  if (days > 7) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago` 
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago` 
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago` 
  } else {
    return 'Just now' 
  }
} 

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text 
  return text.substring(0, maxLength) + '...' 
} 

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) 
} 

export const validatePassword = (password) => {
  return password && password.length >= 8 
} 