import { RouteObject } from 'react-router-dom'
import { UserRole } from './types/index'

import PageLayout from './layout/PageLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './auth/Login'
import Register from './auth/Register'
import EventList from './events/EventList'
import EventDetails from './events/EventDetails'
import CreateEvent from './events/CreateEvent'
import EventManagement from './events/EventManagement'
import MyRegistrations from './events/MyRegistrations'
import MyEvents from './events/MyEvents'
import ParticipantSubmission from './submissions/ParticipantSubmission'
import SubmissionEditor from './submissions/SubmissionEditor'
import OrganizerSubmissions from './submissions/OrganizerSubmissions'
import SubmissionViewer from './submissions/SubmissionViewer'

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
      // === 🌍 PUBLIC ROUTES (Accessible to Everyone) ===
      {
        path: '/',
        element: <EventList /> // No ProtectedRoute wrapper
      },
      {
        path: '/events',
        element: <EventList /> // No ProtectedRoute wrapper
      },
      {
        path: '/events/:eventId',
        element: <EventDetails /> // No ProtectedRoute wrapper
      },

      // === 🔒 PROTECTED ROUTES (Require Login) ===
      
      // Organizer: Create Event
      {
        path: '/events/create',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <CreateEvent />
          </ProtectedRoute>
        )
      },
      // Participant: My Registrations
      {
        path: '/my-registrations',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <MyRegistrations />
          </ProtectedRoute>
        )
      },
      // Organizer: My Events
      {
        path: '/my-events',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <MyEvents />
          </ProtectedRoute>
        )
      },
      // Organizer: Manage Event
      {
        path: '/events/:eventId/manage',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <EventManagement />
          </ProtectedRoute>
        )
      },
      // Participant: Submit Work
      {
        path: '/events/:eventId/submission',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <ParticipantSubmission />
          </ProtectedRoute>
        )
      },
      // Participant: Edit Submission
      {
        path: '/events/:eventId/submission/edit',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <SubmissionEditor />
          </ProtectedRoute>
        )
      },
      // Organizer: View All Submissions
      {
        path: '/events/:eventId/submissions',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <OrganizerSubmissions />
          </ProtectedRoute>
        )
      },
      // Organizer/Judge: Grade Submission
      {
        path: '/events/:eventId/submissions/:submissionId/view',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER, UserRole.JUDGE]}>
            <SubmissionViewer />
          </ProtectedRoute>
        )
      }
    ]
  }
]