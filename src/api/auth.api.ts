import axiosInstance from './axios'
import { AuthResponse, User } from '../types'

export const authApi = {
  login: (email: string, password: string) =>
    axiosInstance.post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: string) =>
    axiosInstance.post<AuthResponse>('/auth/register', { name, email, password, role }),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setCurrentUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }
}
