import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api/events.api'
import { EventType } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  Globe,
  Layers,
  Radio,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react'
import { getErrorMessage } from '../utils/formatters'

const EVENT_TYPES = [
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'FEST', label: 'Festival' },
  { value: 'PROGRAM', label: 'Program' },
  { value: 'CUSTOM', label: 'Custom' }
]

export const CreateEvent = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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

  const TOTAL_STEPS = 4

  const progress = useMemo(() => {
    return (currentStep / TOTAL_STEPS) * 100
  }, [currentStep])

  const stepTitles = ['Basics', 'Timeline', 'Features', 'Review']

  const featureCards: Array<{
    key: keyof typeof formData.capabilities
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    {
      key: 'registration',
      title: 'Registration',
      description: 'Allow participants to register for this event.',
      icon: ClipboardList
    },
    {
      key: 'submissions',
      title: 'Submissions',
      description: 'Enable project/content submissions.',
      icon: Layers
    },
    {
      key: 'teams',
      title: 'Teams',
      description: 'Allow users to participate in teams.',
      icon: Users
    },
    {
      key: 'review',
      title: 'Review',
      description: 'Enable review workflow for submissions.',
      icon: ShieldCheck
    },
    {
      key: 'scoring',
      title: 'Scoring',
      description: 'Track and show scoring outcomes.',
      icon: Star
    },
    {
      key: 'sessions',
      title: 'Sessions',
      description: 'Add session/module handling in event flow.',
      icon: CalendarClock
    },
    {
      key: 'realtime',
      title: 'Realtime',
      description: 'Enable real-time updates and interactions.',
      icon: Radio
    }
  ]

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

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
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
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Create New Event</h1>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          {stepTitles.map((title, index) => (
            <span
              key={title}
              className={index + 1 === currentStep ? 'text-primary-700 font-semibold' : ''}
            >
              {index + 1}. {title}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        {currentStep === 1 && (
          <>
            <div className="flex items-center gap-2 text-primary-700 mb-2">
              <ClipboardList className="w-5 h-5" />
              <p className="font-semibold">Step 1: Basics</p>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {EVENT_TYPES.map((t) => (
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.value === 'true' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="flex items-center gap-2 text-primary-700 mb-2">
              <CalendarClock className="w-5 h-5" />
              <p className="font-semibold">Step 2: Timeline</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </>
        )}

        {currentStep === 3 && (
          <>
            <div className="flex items-center gap-2 text-primary-700 mb-2">
              <Layers className="w-5 h-5" />
              <p className="font-semibold">Step 3: Features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureCards.map((feature) => {
                const selected = formData.capabilities[feature.key]
                const Icon = feature.icon

                return (
                  <button
                    key={feature.key}
                    type="button"
                    onClick={() => handleCapabilityChange(feature.key)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${selected ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{feature.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <div className="flex items-center gap-2 text-primary-700 mb-2">
              <Eye className="w-5 h-5" />
              <p className="font-semibold">Step 4: Review</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="font-semibold text-gray-900">{formData.title || '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Event Type</p>
                <p className="font-semibold text-gray-900">{formData.eventType}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Visibility</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {formData.isPublic ? 'Public' : 'Private'}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Timeline</p>
                <p className="font-semibold text-gray-900">{formData.startDate || '—'} → {formData.endDate || '—'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-800 whitespace-pre-wrap">{formData.description || '—'}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-3">Enabled Features</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(formData.capabilities)
                  .filter(([, enabled]) => enabled)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {key}
                    </span>
                  ))}
                {Object.values(formData.capabilities).every((enabled) => !enabled) && (
                  <span className="text-sm text-gray-500">No features enabled.</span>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/events')}
          >
            Cancel
          </Button>

          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
            >
              Back
            </Button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create Event
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CreateEvent
