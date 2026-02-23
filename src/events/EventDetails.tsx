import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { eventsApi } from '../api/events.api'
import { participationApi } from '../api/participation.api'
import { Event, Participation } from '../types'
import { useAuth } from '../auth/AuthContext'
import Badge from '../components/Badge'
import Button from '../components/Button'
                                            
import Modal from '../components/Modal'
import { RegistrationModal } from '../components/RegistrationModal'
import { AlertCircle, ChevronDown, ChevronUp, Mail, Search, Users } from 'lucide-react'
import { formatDate, getErrorMessage } from '../utils/formatters'
import { Link } from 'react-router-dom'

export const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const location = useLocation()

                                                                                           
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
      throw err                                                
    }
  }

                                     
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
        <ParticipantsList eventId={event._id} formSchema={event.registrationForm} />
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

const ParticipantsList = ({ eventId, formSchema }: { eventId: string; formSchema?: any[] }) => {
  const [participants, setParticipants] = useState<Participation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    participationApi.listParticipants(eventId)
      .then(res => setParticipants(res.data.data))
      .finally(() => setIsLoading(false))
  }, [eventId])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredParticipants = participants.filter((participant) => {
    if (!normalizedSearch) return true
    const name = participant.user.name.toLowerCase()
    const email = participant.user.email.toLowerCase()
    return name.includes(normalizedSearch) || email.includes(normalizedSearch)
  })

  const formatAnswerValue = (value: unknown) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const getLabel = (key: string) => {
    const field = formSchema?.find((item) => item?.id === key)
    return field?.label || key
  }

  // if (isLoading) return <Loader />
  if (isLoading) return <div className="text-center py-4">Loading participants...</div>

  if (participants.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
        <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-800 font-medium">No participants yet</p>
        <p className="text-sm text-gray-500 mt-1">Registrations will appear here once users join this event.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        />
      </div>

      {filteredParticipants.length === 0 ? (
        <div className="py-10 text-center bg-gray-50 border border-gray-200 rounded-xl">
          <Search className="w-9 h-9 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-800 font-medium">No participants match your search.</p>
        </div>
      ) : (
        filteredParticipants.map(p => (
          <div key={p._id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0">
                  {p.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.user.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 truncate">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{p.user.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Badge status={p.status} />
              </div>
            </div>

            {(() => {
              const registrationAnswers = p.answers ?? p.metadata
              if (!registrationAnswers || Object.keys(registrationAnswers).length === 0) {
                return null
              }

              const isExpanded = expandedId === p._id

              return (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : p._id)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                  >
                    <span>View Answers</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Form Answers</p>
                      <div className="space-y-2">
                        {Object.entries(registrationAnswers).map(([key, value]) => (
                          <div key={key} className="pb-2 border-b border-gray-200 last:border-b-0 last:pb-0">
                            <p className="text-sm font-medium text-gray-900">{getLabel(key)}</p>
                            <p className="text-sm text-gray-700 break-words mt-0.5">{formatAnswerValue(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        ))
      )}
    </div>
  )
}

export default EventDetails
