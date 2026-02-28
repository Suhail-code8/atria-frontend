import { RouteObject } from 'react-router-dom'
import { UserRole } from './types/index'

import PageLayout from './layout/PageLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './auth/Login'
import Register from './auth/Register'
import EventList from './events/EventList'
import EventLayout from './events/EventLayout'
import EventOverview from './events/EventOverview'
import EventTeamHub from './events/EventTeamHub'
import EventManage from './events/EventManage'
import CreateEvent from './events/CreateEvent'
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
                                                          
      {
        path: '/',
        element: <EventList />                             
      },
      {
        path: '/events',
        element: <EventList />                             
      },
      {
        path: '/events/:id',
        element: <EventLayout />,
        children: [
          {
            index: true,
            element: <EventOverview />
          },
          {
            path: 'team',
            element: <EventTeamHub />
          },
          {
            path: 'manage',
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
                <EventManage />
              </ProtectedRoute>
            )
          },
          {
            path: 'manage/:section',
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
                <EventManage />
              </ProtectedRoute>
            )
          }
        ]
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
        path: '/my-registrations',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <MyRegistrations />
          </ProtectedRoute>
        )
      },
                             
      {
        path: '/my-events',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <MyEvents />
          </ProtectedRoute>
        )
      },
                                
                                 
      {
        path: '/events/:eventId/submission',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <ParticipantSubmission />
          </ProtectedRoute>
        )
      },
                                     
      {
        path: '/events/:eventId/submission/edit',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT]}>
            <SubmissionEditor />
          </ProtectedRoute>
        )
      },
                                        
      {
        path: '/events/:eventId/submissions',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
            <OrganizerSubmissions />
          </ProtectedRoute>
        )
      },
                                          
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