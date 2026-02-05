import { useEffect, useState } from 'react'
import { eventsApi } from '../api/events.api'
import { Event } from '../types'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Badge from '../components/Badge'
// import Loader from '../components/Loader'
import { AlertCircle, Calendar } from 'lucide-react'
import { formatDate } from '../utils/formatters'

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

      {!isLoading && events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events yet</p>
        </div>
      ) : !isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              onClick={() => console.log('[EventList] link click', { id: event._id })}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow h-full p-6 border border-gray-200 hover:border-primary-300 no-underline text-inherit"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title}</h3>
                <Badge status={event.status} />
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(event.startDate)} – {formatDate(event.endDate)}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {event.hasSubmissions && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Submissions</span>}
                {event.hasJudging && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Judging</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default EventList
