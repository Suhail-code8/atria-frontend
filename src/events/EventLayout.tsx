import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { eventsApi } from '../api/events.api'
import { participationApi } from '../api/participation.api'
import { useAuth } from '../auth/AuthContext'
import { Event, EventStatus, Participation, UserRole } from '../types'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import EventAnnouncements from '../components/announcements/EventAnnouncements'
import { RegistrationModal } from '../components/RegistrationModal'
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Search,
  Users
} from 'lucide-react'
import { formatDate, getErrorMessage } from '../utils/formatters'

export interface EventLayoutOutletContext {
  event: Event
  setEvent: Dispatch<SetStateAction<Event | null>>
  participation: Participation | null
  currentUser: ReturnType<typeof useAuth>['user']
  refreshEvent: () => Promise<void>
}

export const EventLayout = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [participants, setParticipants] = useState<Participation[]>([])
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(false)
  const [participantsSearch, setParticipantsSearch] = useState('')
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  const loadEvent = useCallback(async () => {
    if (!id) {
      setError('Invalid event URL. Event ID is missing.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const eventRes = await eventsApi.getEvent(id)
      setEvent(eventRes.data.data)

      if (user?.role === UserRole.PARTICIPANT) {
        try {
          const participationRes = await participationApi.getMyParticipation(id)
          setParticipation(participationRes.data.data)
        } catch {
          setParticipation(null)
        }
      } else {
        setParticipation(null)
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    loadEvent()
  }, [loadEvent])

  const handleRegister = async (answers: Record<string, any>) => {
    if (!event) return

    try {
      const response = await participationApi.registerForEvent(event._id, answers)
      setParticipation(response.data.data)
      setShowRegistrationModal(false)
      setError('')
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    }
  }

  const loadParticipants = useCallback(async () => {
    if (!event?._id) return

    setIsParticipantsLoading(true)
    try {
      const response = await participationApi.listParticipants(event._id)
      setParticipants(response.data.data)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsParticipantsLoading(false)
    }
  }, [event?._id])

  const handleOpenParticipants = async () => {
    setShowParticipants(true)
    await loadParticipants()
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading event...</div>
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-2">Event not found</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    )
  }

  const isOrganizer = user?.role === UserRole.ORGANIZER
  const eventCreatorId =
    typeof event.createdBy === 'string'
      ? event.createdBy
      : (event.createdBy as any)?._id
  const isCreator = user?._id === eventCreatorId
  const isRegistered = Boolean(participation)
  const canRegister =
    !isCreator &&
    !isRegistered &&
    Boolean(user) &&
    event.status === EventStatus.REGISTRATION_OPEN &&
    event.capabilities.registration === true

  const normalizedParticipantSearch = participantsSearch.trim().toLowerCase()
  const filteredParticipants = participants.filter((participant) => {
    if (!normalizedParticipantSearch) return true
    const name = participant.user?.name?.toLowerCase?.() || ''
    const email = participant.user?.email?.toLowerCase?.() || ''
    return (
      name.includes(normalizedParticipantSearch) ||
      email.includes(normalizedParticipantSearch)
    )
  })

  const formatAnswerValue = (value: unknown) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const getAnswerLabel = (key: string) => {
    const field = event.registrationForm?.find((item) => item?.id === key)
    return field?.label || key
  }

  return (
    <div className="space-y-6">
      <Link to="/events" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mb-2 transition-colors">
        ← Back to Events
      </Link>

      {event.posterUrl && (
        <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden relative shadow-lg">
          <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
            <div>
              <Badge status={event.status} className="mb-3" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">{event.title}</h1>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <header className="bg-white rounded-xl shadow p-6 md:p-8">
        {!event.posterUrl && (
          <div className="flex flex-wrap items-start justify-between gap-4 w-full">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">Event</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{event.title}</h1>
              <p className="text-gray-600 mt-2 max-w-3xl">{event.description}</p>
            </div>
            <Badge status={event.status} />
          </div>
        )}
        {event.posterUrl && (
          <p className="text-gray-600 max-w-3xl">{event.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Start</p>
            <p className="font-semibold text-gray-900 mt-1">{formatDate(event.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">End</p>
            <p className="font-semibold text-gray-900 mt-1">{formatDate(event.endDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
            <p className="font-semibold text-gray-900 mt-1">{(event as any).location || (event as any).venue || 'TBA'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {canRegister && (
            <Button variant="primary" onClick={() => setShowRegistrationModal(true)}>
              Register for Event
            </Button>
          )}

          {isRegistered && (
            <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              <span className="font-semibold">✓ Registered</span>
              <Badge status={participation?.status || ''} />
            </div>
          )}

          {isRegistered && event.capabilities.submissions === true && (
            <Link to={`/events/${event._id}/submission`}>
              <Button variant="secondary">My Submission</Button>
            </Link>
          )}

          {isCreator && event.capabilities.submissions === true && (
            <Link to={`/events/${event._id}/submissions`}>
              <Button variant="secondary">View Submissions</Button>
            </Link>
          )}

          {isCreator && (
            <Button variant="secondary" onClick={handleOpenParticipants}>
              <Users className="w-4 h-4" />
              View Participants
            </Button>
          )}
        </div>
      </header>

      {isOrganizer ? (
        <div className="space-y-6">
          <EventAnnouncements eventId={event._id} />

          <nav className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto">
            <NavLink
              to="manage"
              end
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Analytics
            </NavLink>

            <NavLink
              to="manage/configuration"
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Configuration
            </NavLink>

            <NavLink
              to="manage/promotion"
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Promotion
            </NavLink>

            <NavLink
              to="manage/announcements"
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Announcements
            </NavLink>

            <NavLink
              to="manage/teams"
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Teams
            </NavLink>

            <NavLink
              to="manage/scoring"
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Scoring
            </NavLink>
          </nav>
          <Outlet context={{ event, setEvent, participation, currentUser: user, refreshEvent: loadEvent }} />
        </div>
      ) : (
        <>
          <EventAnnouncements eventId={event._id} />
          <Outlet context={{ event, setEvent, participation, currentUser: user, refreshEvent: loadEvent }} />
        </>
      )}

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleRegister}
        fields={event.registrationForm || []}
        eventTitle={event.title}
      />

      <Modal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        title="Event Participants"
        size="lg"
      >
        {isParticipantsLoading ? (
          <div className="text-center py-4">Loading participants...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-4 text-gray-600">No participants yet.</div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={participantsSearch}
                onChange={(e) => setParticipantsSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              />
            </div>

            {filteredParticipants.length === 0 ? (
              <div className="text-center py-4 text-gray-600">No participants match your search.</div>
            ) : (
              filteredParticipants.map((participant) => {
                const registrationAnswers = participant.answers ?? participant.metadata
                const hasAnswers =
                  !!registrationAnswers &&
                  Object.keys(registrationAnswers).length > 0
                const isExpanded = expandedParticipantId === participant._id
                const participantName = participant.user?.name || 'Unknown User'
                const participantEmail = participant.user?.email || 'No email available'

                return (
                  <div key={participant._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{participantName}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{participantEmail}</span>
                        </div>
                      </div>
                      <Badge status={participant.status} />
                    </div>

                    {hasAnswers && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedParticipantId(
                              isExpanded ? null : participant._id
                            )
                          }
                          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                        >
                          <span>View Answers</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="bg-gray-50 p-3 rounded-lg mt-2 space-y-2">
                            {Object.entries(registrationAnswers).map(([key, value]) => (
                              <div
                                key={key}
                                className="pb-2 border-b border-gray-200 last:border-b-0 last:pb-0"
                              >
                                <p className="text-sm font-medium text-gray-900">{getAnswerLabel(key)}</p>
                                <p className="text-sm text-gray-700 break-words mt-0.5">
                                  {formatAnswerValue(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EventLayout