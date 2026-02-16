import { useEffect, useState } from 'react'
import { eventsApi } from '../api/events.api'
import { Event, EventStatus } from '../types'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
// import Loader from '../components/Loader'
import { AlertCircle } from 'lucide-react'
import EventCard from './EventCard'

const PUBLIC_STATUSES = new Set<string>([
  EventStatus.PUBLISHED,
  EventStatus.REGISTRATION_OPEN,
  'REGISTRATION_CLOSED',
  EventStatus.ONGOING,
  EventStatus.COMPLETED
])

export const EventList = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await eventsApi.listEvents()
      setEvents(response.data.data)
      setError('')
    } catch (err: any) {
      setError('Failed to load events')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const visibleEvents = events.filter((event) => PUBLIC_STATUSES.has(String(event.status)))

  // if (isLoading) return <Loader />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        {user?.role === 'ORGANIZER' && (
          <Link
            to="/events/create"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Create Event
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading events...</p>
        </div>
      )}

      {!isLoading && visibleEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No upcoming events found.</p>
        </div>
      ) : !isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default EventList
