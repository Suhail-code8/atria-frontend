import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, Bell, Info, Trash2, TriangleAlert } from 'lucide-react'
import {
  announcementApi,
  AnnouncementPriority,
  IAnnouncement
} from '../../api/announcement.api'
import Button from '../Button'
import Input from '../Input'
import { formatDateTime, getErrorMessage } from '../../utils/formatters'

interface OrganizerAnnouncementsProps {
  eventId: string
}

const OrganizerAnnouncements = ({ eventId }: OrganizerAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<AnnouncementPriority>(AnnouncementPriority.INFO)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadAnnouncements = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await announcementApi.getForEvent(eventId)
      setAnnouncements(response.data.data)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [eventId])

  const clearForm = () => {
    setTitle('')
    setContent('')
    setPriority(AnnouncementPriority.INFO)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await announcementApi.create(eventId, {
        title: title.trim(),
        content: content.trim(),
        priority
      })
      clearForm()
      await loadAnnouncements()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError('')

    try {
      await announcementApi.delete(id)
      setAnnouncements((prev) => prev.filter((item) => item._id !== id))
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="bg-white rounded-lg shadow p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Broadcast Announcements</h2>
        <p className="text-sm text-gray-600 mt-1">Post updates that participants can immediately see.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement title"
          maxLength={120}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the announcement details"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
            className="w-full md:w-60 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={AnnouncementPriority.INFO}>Info</option>
            <option value={AnnouncementPriority.WARNING}>Warning</option>
            <option value={AnnouncementPriority.URGENT}>Urgent</option>
          </select>
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          Post Announcement
        </Button>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Existing Announcements</h3>

        {isLoading ? (
          <p className="text-sm text-gray-600">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-8 text-center">
            <p className="text-gray-700 font-medium">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => {
              const priorityIcon =
                announcement.priority === AnnouncementPriority.URGENT ? (
                  <TriangleAlert className="w-4 h-4 text-red-600" />
                ) : announcement.priority === AnnouncementPriority.WARNING ? (
                  <Bell className="w-4 h-4 text-amber-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )

              return (
                <div key={announcement._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {priorityIcon}
                        <p className="font-semibold text-gray-900">{announcement.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(announcement.createdAt)}</p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(announcement._id)}
                      isLoading={deletingId === announcement._id}
                      disabled={deletingId !== null && deletingId !== announcement._id}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>

                  <p className="text-sm text-gray-800 mt-3 whitespace-pre-wrap">{announcement.content}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default OrganizerAnnouncements
