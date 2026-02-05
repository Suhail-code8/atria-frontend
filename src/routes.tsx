import { RouteObject } from 'react-router-dom'
import { UserRole } from './types/index'

import PageLayout from './layout/PageLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './auth/Login'
import Register from './auth/Register'
import EventList from './events/EventList'
import EventDetails from './events/EventDetails'
import CreateEvent from './events/CreateEvent'
import MySubmissions from './submissions/MySubmissions'
import SubmissionEditor from './submissions/SubmissionEditor'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    element: <PageLayout />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <EventList />
          </ProtectedRoute>
        )
      },
      {
        path: '/events',
        element: (
          <ProtectedRoute>
            <EventList />
          </ProtectedRoute>
        )
      },
      {
        path: '/events/create',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <CreateEvent />
          </ProtectedRoute>
        )
      },
      {
        path: '/events/:eventId',
        element: (
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        )
      },
      {
        path: '/events/:eventId/my-submissions',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <MySubmissions />
          </ProtectedRoute>
        )
      },
      {
        path: '/events/:eventId/my-submissions/:submissionId',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <SubmissionEditor />
          </ProtectedRoute>
        )
      }
    ]
  }
]
