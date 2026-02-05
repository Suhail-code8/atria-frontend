import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuth } from './AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import { AlertCircle } from 'lucide-react'

const ROLES = [
  { value: 'ORGANIZER', label: 'Organizer' },
  { value: 'PARTICIPANT', label: 'Participant' }
]

export const Register = () => {
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PARTICIPANT' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authApi.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      )
      const { accessToken, user } = response.data.data
      
      setAccessToken(accessToken)
      setUser(user)
      navigate('/events')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Atria</h1>
        <p className="text-gray-600 mb-8">Create your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
