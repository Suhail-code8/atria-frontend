import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../api/auth.api'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export const Navbar = () => {
  const { user, setUser, setAccessToken } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      authApi.clearAuth()
      setUser(null)
      setAccessToken(null)
      navigate('/login')
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/events" className="text-xl font-bold text-primary-600">
          Atria
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/events"
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Events
              </Link>
              {user.role === 'ORGANIZER' && (
                <Link
                  to="/events/create"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Create Event
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
