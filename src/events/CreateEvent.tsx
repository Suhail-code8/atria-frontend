import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api/events.api'
import { EventType } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import { AlertCircle } from 'lucide-react'
import { getErrorMessage } from '../utils/formatters'

const EVENT_TYPES = [
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'FEST', label: 'Festival' },
  { value: 'PROGRAM', label: 'Program' },
  { value: 'CUSTOM', label: 'Custom' }
]

export const CreateEvent = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'CONFERENCE' as EventType,
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    isPublic: true,
    capabilities: {
      registration: false,
      submissions: false,
      review: false,
      teams: false,
      scoring: false,
      sessions: false,
      realtime: false
    }
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCapabilityChange = (capability: keyof typeof formData.capabilities) => {
    setFormData(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities[capability]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await eventsApi.createEvent(formData)
      navigate(`/events/${response.data.data._id}`)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <Input
          label="Event Title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <select
              name="isPublic"
              value={formData.isPublic ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.value === 'true' }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Start Date"
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          <Input
            label="End Date"
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Registration Start Date"
            type="datetime-local"
            name="registrationStartDate"
            value={formData.registrationStartDate}
            onChange={handleChange}
          />
          <Input
            label="Registration End Date"
            type="datetime-local"
            name="registrationEndDate"
            value={formData.registrationEndDate}
            onChange={handleChange}
          />
        </div>

        <div className="border-t pt-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Capabilities & Features</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.registration}
                onChange={() => handleCapabilityChange('registration')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Registration</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.submissions}
                onChange={() => handleCapabilityChange('submissions')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Submissions</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.teams}
                onChange={() => handleCapabilityChange('teams')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Teams</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.review}
                onChange={() => handleCapabilityChange('review')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Review</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.scoring}
                onChange={() => handleCapabilityChange('scoring')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Scoring</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.sessions}
                onChange={() => handleCapabilityChange('sessions')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Sessions</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.capabilities.realtime}
                onChange={() => handleCapabilityChange('realtime')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Enable Real-time Updates</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Event
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/events')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateEvent
