import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import {
  announcementApi,
  AnnouncementPriority,
  IAnnouncement
} from '../../api/announcement.api'
import { formatDateTime, getErrorMessage } from '../../utils/formatters'

interface EventAnnouncementsProps {
  eventId: string
}

const priorityUi: Record<AnnouncementPriority, {
  icon: JSX.Element
  cardClass: string
  badgeClass: string
}> = {
  [AnnouncementPriority.INFO]: {
    icon: <Info className="w-4 h-4" />,
    cardClass: 'border-blue-200 bg-blue-50/40',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [AnnouncementPriority.WARNING]: {
    icon: <Bell className="w-4 h-4" />,
    cardClass: 'border-amber-300 bg-amber-50/50',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  [AnnouncementPriority.URGENT]: {
    icon: <AlertTriangle className="w-4 h-4" />,
    cardClass: 'border-red-300 bg-red-50/60',
    badgeClass: 'bg-red-100 text-red-800 border-red-300'
  }
}

const EventAnnouncements = ({ eventId }: EventAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadAnnouncements = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await announcementApi.getForEvent(eventId)
        if (mounted) {
          setAnnouncements(response.data.data)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(getErrorMessage(err))
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadAnnouncements()

    return () => {
      mounted = false
    }
  }, [eventId])

  return (
    <section className="bg-white rounded-lg shadow p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-600 py-4">Loading announcements...</div>
      )}

      {!isLoading && error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && announcements.length === 0 && (
        <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-8 text-center">
          <p className="text-gray-700 font-medium">No announcements yet</p>
        </div>
      )}

      {!isLoading && !error && announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const ui = priorityUi[announcement.priority]

            return (
              <article
                key={announcement._id}
                className={`border rounded-lg p-4 ${ui.cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{announcement.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(announcement.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-2.5 py-1 rounded-full ${ui.badgeClass}`}
                  >
                    {ui.icon}
                    {announcement.priority}
                  </span>
                </div>

                <p className="text-gray-800 mt-3 whitespace-pre-wrap">{announcement.content}</p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default EventAnnouncements
