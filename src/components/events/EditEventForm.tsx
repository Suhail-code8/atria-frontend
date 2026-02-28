import { FormEvent, useEffect, useState } from 'react'
import Button from '../Button'
import Input from '../Input'
import { eventsApi } from '../../api/events.api'
import { Event } from '../../types'
import { getErrorMessage } from '../../utils/formatters'
import { FormBuilder, FormField } from '../FormBuilder'

interface EditEventFormProps {
  event: Event
  setEvent: (event: any) => void
}

export const EditEventForm = ({ event, setEvent }: EditEventFormProps) => {
  const [editData, setEditData] = useState({
    title: event.title || '',
    description: event.description || '',
    isPublic: event.isPublic ?? true,
    registrationStartDate: event.registrationStartDate
      ? new Date(event.registrationStartDate).toISOString().slice(0, 16)
      : '',
    registrationEndDate: event.registrationEndDate
      ? new Date(event.registrationEndDate).toISOString().slice(0, 16)
      : '',
    registrationForm: (event.registrationForm || []) as FormField[],
    capabilities: event.capabilities || {
      registration: false,
      submissions: false,
      review: false,
      teams: false,
      scoring: false,
      sessions: false,
      realtime: false
    },
    isCompetition: event.isCompetition === true,
    startDate: String((event as any).date || event.startDate || ''),
    location: '',
    isLeaderboardPublished: event.isLeaderboardPublished === true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      setEditData({
        title: event.title || '',
        description: event.description || '',
        isPublic: event.isPublic ?? true,
        registrationStartDate: event.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : '',
        registrationEndDate: event.registrationEndDate ? new Date(event.registrationEndDate).toISOString().slice(0, 16) : '',
        registrationForm: (event.registrationForm || []) as FormField[],
        capabilities: event.capabilities || { registration: false, submissions: false, review: false, teams: false, scoring: false, sessions: false, realtime: false },
        isCompetition: event.isCompetition === true,
        startDate: String((event as any).date || event.startDate || ''),
        location: (event as any).location || (event as any).venue || '',
        isLeaderboardPublished: event.isLeaderboardPublished === true
      })
    }
  }, [event])

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCapabilityChange = (capability: keyof typeof editData.capabilities) => {
    setEditData((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities[capability]
      }
    }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        ...editData,
        location: editData.location,
        isCompetition: editData.isCompetition || editData.capabilities.teams || editData.capabilities.scoring
      }
      const res = await eventsApi.updateEvent(event._id, payload as any)
      if (setEvent) {
        setEvent(res.data.data)
      }
      alert('Event configuration saved successfully!')
    } catch (err) {
      console.error('Save failed:', err)
      const message = getErrorMessage(err)
      setError(message)
      alert('Failed to save configuration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSaveChanges()
  }

  return (
    <section className="bg-white rounded-2xl shadow p-6 md:p-8 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">Edit Event</h3>
        <p className="text-sm text-gray-600 mt-1">Update core event details and visibility controls.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={editData.title}
          onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Enter event title"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={editData.description}
            onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter event description"
          />
        </div>

        <Input
          label="Date"
          type="datetime-local"
          value={editData.startDate ? new Date(editData.startDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => setEditData((prev) => ({ ...prev, startDate: e.target.value }))}
        />

        <Input
          label="Event Location"
          type="text"
          name="location"
          value={editData.location}
          onChange={handleEditChange}
        />

        {editData.capabilities.registration && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
            <Input
              label="Registration Start Date"
              type="datetime-local"
              value={editData.registrationStartDate}
              onChange={(e) => setEditData((prev) => ({ ...prev, registrationStartDate: e.target.value }))}
            />
            <Input
              label="Registration End Date"
              type="datetime-local"
              value={editData.registrationEndDate}
              onChange={(e) => setEditData((prev) => ({ ...prev, registrationEndDate: e.target.value }))}
            />
          </div>
        )}

        <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <input
            type="checkbox"
            checked={editData.isLeaderboardPublished}
            onChange={(e) => setEditData((prev) => ({ ...prev, isLeaderboardPublished: e.target.checked }))}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Publish Leaderboard</p>
            <p className="text-xs text-gray-600 mt-1">Make current scores visible to all participants.</p>
          </div>
        </label>

        <div className="border-t pt-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Capabilities</p>
          <div className="space-y-3">
            {Object.keys(editData.capabilities).map((cap) => (
              <label key={cap} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editData.capabilities[cap as keyof typeof editData.capabilities]}
                  onChange={() => handleCapabilityChange(cap as keyof typeof editData.capabilities)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 capitalize">{cap}</span>
              </label>
            ))}
          </div>
        </div>

        {editData.capabilities.registration && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <div className="mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Registration Form</h4>
              <p className="text-xs text-gray-600">
                Customize what information to collect from participants during registration.
              </p>
            </div>
            <FormBuilder
              fields={editData.registrationForm}
              onChange={(fields) => setEditData((prev) => ({ ...prev, registrationForm: fields }))}
            />
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" isLoading={isSaving}>
            Save Event Changes
          </Button>
        </div>
      </form>
    </section>
  )
}

export default EditEventForm
