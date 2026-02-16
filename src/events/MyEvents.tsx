import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Plus } from 'lucide-react'
import { eventsApi } from '../api/events.api'
import { Event } from '../types'
import EventCard from './EventCard'
import Button from '../components/Button'
import { getErrorMessage } from '../utils/formatters'

const MyEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMyEvents = async () => {
      try {
        const response = await eventsApi.getMyEvents()
        setEvents(response.data.data)
        setError('')
      } catch (err: any) {
        setError(getErrorMessage(err) || 'Failed to load events')
      } finally {
        setIsLoading(false)
      }
    }

    loadMyEvents()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <Link to="/events/create">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-600 mb-6">You have not created any events yet.</p>
          <Link to="/events/create">
            <Button variant="primary">Create Event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} showStatus />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEvents
