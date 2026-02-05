import { useLocation, useRoutes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { routes } from './routes'

function App() {
  const location = useLocation()

  console.log('App - Current location:', location.pathname)

  return (
    <AuthProvider>
      <RoutesWrapper />
    </AuthProvider>
  )
}

const RoutesWrapper = () => {
  const element = useRoutes(routes)
  return element
}

export default App
