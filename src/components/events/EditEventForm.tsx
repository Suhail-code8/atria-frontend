import { FormEvent, useEffect, useState } from 'react'
import Button from '../Button'
import Input from '../Input'
import { eventsApi } from '../../api/events.api'
import { Event } from '../../types'
import { getErrorMessage } from '../../utils/formatters'
import { FormBuilder, FormField } from '../FormBuilder'
import { Check, Copy, Globe, Lock, RefreshCw, Ticket } from 'lucide-react'

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
    isLeaderboardPublished: event.isLeaderboardPublished === true,
    isPaid: event.isPaid ?? false,
    price: event.price ?? 0,
    totalSeats: (event.totalSeats ?? '') as number | ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [accessCode, setAccessCode] = useState<string | null>(event.accessCode ?? null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = accessCode
    ? `${window.location.origin}/events/${event._id}?code=${accessCode}`
    : null

  const handleCopy = () => {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const res = await eventsApi.regenerateAccessCode(event._id)
      setAccessCode(res.data.data.accessCode)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsRegenerating(false)
    }
  }

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
        isLeaderboardPublished: event.isLeaderboardPublished === true,
        isPaid: event.isPaid ?? false,
        price: event.price ?? 0,
        totalSeats: (event.totalSeats ?? '') as number | ''
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
        totalSeats: editData.totalSeats === '' ? undefined : editData.totalSeats,
        location: editData.location,
        isCompetition: editData.isCompetition || editData.capabilities.teams || editData.capabilities.scoring
      }
      const res = await eventsApi.updateEvent(event._id, payload as any)
      if (setEvent) {
        setEvent(res.data.data)
        // sync accessCode if backend returns an updated one
        if (res.data.data.accessCode !== undefined) {
          setAccessCode(res.data.data.accessCode ?? null)
        }
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

        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-3">Visibility</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEditData((prev) => ({ ...prev, isPublic: true }))}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                editData.isPublic
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              Public
            </button>
            <button
              type="button"
              onClick={() => setEditData((prev) => ({ ...prev, isPublic: false }))}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                !editData.isPublic
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Lock className="w-4 h-4" />
              Private
            </button>
          </div>
          {!editData.isPublic && inviteUrl && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500">Share this link with participants — anyone with it can view the event:</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  title="Regenerate invite link (invalidates the old one)"
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Reset
                </button>
              </div>
              <p className="text-xs text-amber-600">Resetting generates a new link and instantly invalidates the old one.</p>
            </div>
          )}
          {!editData.isPublic && !inviteUrl && (
            <p className="text-xs text-gray-500 mt-2">Save these settings to generate an invite link.</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={editData.isPaid}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  isPaid: e.target.checked,
                  price: e.target.checked ? prev.price : 0
                }))
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-gray-600" />
              <p className="font-semibold text-gray-900">Paid Event (Ticketing)</p>
            </div>
          </label>
          {editData.isPaid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={editData.price}
                  onChange={(e) => setEditData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="e.g. 499"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={editData.totalSeats}
                  onChange={(e) => setEditData((prev) => ({ ...prev, totalSeats: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

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
