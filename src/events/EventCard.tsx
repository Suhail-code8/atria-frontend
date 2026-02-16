import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import Badge from '../components/Badge'
import { Event } from '../types'
import { formatDate } from '../utils/formatters'

interface EventCardProps {
  event: Event
  showStatus?: boolean
}

const EventCard = ({ event, showStatus = true }: EventCardProps) => {
  return (
    <Link
      to={`/events/${event._id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow h-full p-6 border border-gray-200 hover:border-primary-300 no-underline text-inherit"
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title}</h3>
        {showStatus && <Badge status={String(event.status)} />}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <Calendar className="w-4 h-4" />
        <span>
          {formatDate(event.startDate)} – {formatDate(event.endDate)}
        </span>
      </div>
    </Link>
  )
}

export default EventCard
