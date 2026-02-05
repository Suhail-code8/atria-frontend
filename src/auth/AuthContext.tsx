import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setAccessToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const value = {
    user,
    accessToken,
    isLoading,
    setUser: (newUser: User | null) => {
      setUser(newUser)
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser))
      } else {
        localStorage.removeItem('user')
      }
    },
    setAccessToken: (token: string | null) => {
      setAccessToken(token)
      if (token) {
        localStorage.setItem('accessToken', token)
      } else {
        localStorage.removeItem('accessToken')
      }
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
