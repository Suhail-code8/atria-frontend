import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { eventsApi } from '../api/events.api'
import { participationApi } from '../api/participation.api'
import { Event, Participation } from '../types'
import { useAuth } from '../auth/AuthContext'
import Badge from '../components/Badge'
import Button from '../components/Button'
// import Loader from '../components/Loader'
import Modal from '../components/Modal'
import { RegistrationModal } from '../components/RegistrationModal'
import { AlertCircle, Users } from 'lucide-react'
import { formatDate, getErrorMessage } from '../utils/formatters'
import { Link } from 'react-router-dom'

export const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const location = useLocation()

  // Fallback: also derive ID from URL path in case route params don't populate as expected
  const pathEventId = location.pathname.split('/').filter(Boolean).pop()
  const effectiveEventId = eventId || pathEventId
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  useEffect(() => {
    loadEvent(effectiveEventId)
  }, [effectiveEventId])

  const loadEvent = async (id?: string | null) => {
    console.log('[EventDetails] loadEvent start', { routeParam: eventId, pathEventId, effectiveEventId: id })

    if (!id) {
      console.error('[EventDetails] no eventId found in route params or URL path')
      setError('Invalid event URL. Event ID is missing.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const eventRes = await eventsApi.getEvent(id)
      console.log('[EventDetails] api response', eventRes)
      setEvent(eventRes.data.data)
      setError('')

      if (user && id) {
        try {
          const partRes = await participationApi.getMyParticipation(id)
          setParticipation(partRes.data.data)
        } catch (err) {
          setParticipation(null)
        }
      }
    } catch (err: any) {
      console.error('[EventDetails] loadEvent error', err)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (answers: Record<string, any>) => {
    if (!eventId) return
    try {
      const res = await participationApi.registerForEvent(eventId, answers)
      setParticipation(res.data.data)
      setShowRegistrationModal(false)
      setError('')
    } catch (err: any) {
      setError(getErrorMessage(err))
      throw err // Re-throw to let modal handle the error state
    }
  }

  // if (isLoading) return <Loader />
  if (isLoading) return <div className="text-center py-12">Loading event...</div>
  if (!event) return (
    <div className="text-center py-12">
      <p className="text-red-600 font-semibold mb-2">Event not found</p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Link to="/events" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
        ← Back to Events
      </Link>
    </div>
  )

  const isCreator = user?._id === event.createdBy
  const isRegistered = !!participation

  return (
    <div>
      <Link to="/events" className="text-primary-600 hover:text-primary-700 mb-6 inline-block">
        ← Back to Events
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <Badge status={event.status} />
          </div>
        </div>

        <p className="text-gray-600 mb-6 text-lg">{event.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b">
          <div>
            <p className="text-sm text-gray-600 mb-1">Type</p>
            <p className="font-semibold">{event.eventType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <Badge status={event.status} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="font-semibold">{formatDate(event.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">End Date</p>
            <p className="font-semibold">{formatDate(event.endDate)}</p>
          </div>
        </div>

        <div className="flex gap-4">
          {!isCreator && !isRegistered && user && event.status === 'REGISTRATION_OPEN' && event.capabilities.registration && (
            <Button
              variant="primary"
              onClick={() => setShowRegistrationModal(true)}
            >
              Register for Event
            </Button>
          )}
          {isRegistered && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              <span className="font-semibold">✓ Registered</span>
              <Badge status={participation?.status || ''} />
            </div>
          )}
          {isCreator && (
            <>
              <Link to={`/events/${event._id}/manage`}>
                <Button variant="secondary">Manage Event</Button>
              </Link>
              {event.capabilities.submissions && (
                <Link to={`/events/${event._id}/submissions`}>
                  <Button variant="secondary">View Submissions</Button>
                </Link>
              )}
              <Button variant="secondary" onClick={() => setShowParticipants(true)}>
                <Users className="w-4 h-4" />
                View Participants
              </Button>
            </>
          )}
          {isRegistered && event.capabilities.submissions && (
            <Link to={`/events/${event._id}/submission`}>
              <Button variant="secondary">My Submission</Button>
            </Link>
          )}
        </div>
      </div>

      <Modal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        title="Event Participants"
        size="lg"
      >
        <ParticipantsList eventId={event._id} />
      </Modal>

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleRegister}
        fields={event.registrationForm || []}
        eventTitle={event.title}
      />
    </div>
  )
}

const ParticipantsList = ({ eventId }: { eventId: string }) => {
  const [participants, setParticipants] = useState<Participation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    participationApi.listParticipants(eventId)
      .then(res => setParticipants(res.data.data))
      .finally(() => setIsLoading(false))
  }, [eventId])

  // if (isLoading) return <Loader />
  if (isLoading) return <div className="text-center py-4">Loading participants...</div>

  return (
    <div className="space-y-3">
      {participants.map(p => (
        <div key={p._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold">{p.user.name}</p>
            <p className="text-sm text-gray-600">{p.user.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge status={p.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default EventDetails
