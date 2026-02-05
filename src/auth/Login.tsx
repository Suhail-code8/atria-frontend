import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuth } from './AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import { AlertCircle } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authApi.login(email, password)
      const { accessToken, user } = response.data.data
      
      setAccessToken(accessToken)
      setUser(user)
      navigate('/events')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Atria</h1>
        <p className="text-gray-600 mb-8">Event Platform</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{' '}
          <a href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
