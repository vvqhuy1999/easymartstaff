/**
 * tokenStorage.js - Universal token storage utility
 * 
 * Supports localStorage, sessionStorage, and cookies
 * Centralized token management for the entire app
 */

// Configuration
let TOKEN_STORAGE_TYPE = 'cookie' // 'localStorage', 'sessionStorage', or 'cookie'
const TOKEN_KEY = 'easymartadmin-token'
const TOKEN_EXPIRY_DAYS = 1 // Token chỉ lưu 1 ngày

// Cookie utility functions
const setCookie = (name, value, days = 1, secure = false, httpOnly = false) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = `; expires=${date.toUTCString()}`
  }
  
  let cookieString = `${name}=${value || ''}${expires}; path=/`
  
  if (secure) {
    cookieString += '; Secure'
  }
  
  if (httpOnly) {
    cookieString += '; HttpOnly'
  }
  
  // SameSite attribute for CSRF protection
  cookieString += '; SameSite=Strict'
  
  document.cookie = cookieString
}

const getCookie = (name) => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length)
      return value
    }
  }
  return null
}

const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
}

// Universal token storage functions
export const setToken = (token) => {
  
  if (TOKEN_STORAGE_TYPE === 'cookie') {
    // Use secure cookie in production
    const isProduction = window.location.protocol === 'https:'
    setCookie(TOKEN_KEY, token, TOKEN_EXPIRY_DAYS, isProduction, false)

  } else if (TOKEN_STORAGE_TYPE === 'localStorage') {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export const getToken = () => {
  
  let token = null
  
  if (TOKEN_STORAGE_TYPE === 'cookie') {
    token = getCookie(TOKEN_KEY)
  } else if (TOKEN_STORAGE_TYPE === 'localStorage') {
    token = localStorage.getItem(TOKEN_KEY)
  } else {
    token = sessionStorage.getItem(TOKEN_KEY)
  }
  
  console.log('🔍 [TOKEN] Storage type:', TOKEN_STORAGE_TYPE)
  console.log('🔍 [TOKEN] Token found:', !!token, token ? `Length: ${token.length}` : 'No token')
  
  return token
}

export const removeToken = () => {
  if (TOKEN_STORAGE_TYPE === 'cookie') {
    removeCookie(TOKEN_KEY)
  } else if (TOKEN_STORAGE_TYPE === 'localStorage') {
    localStorage.removeItem(TOKEN_KEY)
  } else {
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

// Check if token exists
export const hasToken = () => {
  const token = getToken()
  return !!(token && token.length > 0)
}

// Check if user has valid role for admin access
export const hasValidRole = () => {
  const userRole = getCookie('user_role')
  const allowedRoles = ['MANAGER', 'EMPLOYEE', 'ADMIN']
  return !!(userRole && allowedRoles.includes(userRole.toUpperCase()))
}

// Get user role
export const getUserRole = () => {
  return getCookie('user_role')
}

// Check if user has specific role
export const hasRole = (role) => {
  try {
    const token = getToken()
    if (!token) {
      console.log('🔍 [ROLE] No token found')
      return false
    }
    
    // Decode JWT token to get role
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role
    
    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp && payload.exp < currentTime
    
    console.log('🔍 [ROLE] Token payload:', payload)
    console.log('🔍 [ROLE] Current time:', currentTime)
    console.log('🔍 [ROLE] Token expires at:', payload.exp)
    console.log('🔍 [ROLE] Token expired:', isExpired)
    console.log('🔍 [ROLE] User role:', userRole, 'Checking for:', role)
    console.log('🔍 [ROLE] Role match:', userRole && userRole.toUpperCase() === role.toUpperCase())
    
    if (isExpired) {
      console.log('🔍 [ROLE] Token has expired, removing...')
      removeToken()
      return false
    }
    
    return userRole && userRole.toUpperCase() === role.toUpperCase()
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

// Get current storage type
export const getStorageType = () => {
  return TOKEN_STORAGE_TYPE
}

// Change storage type (for switching between storage methods)
export const setStorageType = (newType) => {
  if (['localStorage', 'sessionStorage', 'cookie'].includes(newType)) {
    // Migrate existing token if needed
    const currentToken = getToken()
    
    // Update storage type
    TOKEN_STORAGE_TYPE = newType
    
    // Re-store token with new method
    if (currentToken) {
      setToken(currentToken)
    }
  } else {
    console.error('Invalid storage type. Use: localStorage, sessionStorage, or cookie')
  }
}



// Export for easy access
export default {
  setToken,
  getToken,
  removeToken,
  hasToken,
  getStorageType,
  setStorageType
}
