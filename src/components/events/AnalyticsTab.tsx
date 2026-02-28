import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { eventsApi, EventAnalytics } from '../../api/events.api'
import { Event, EventStatus } from '../../types'
import Badge from '../Badge'
import Modal from '../Modal'
import { getErrorMessage } from '../../utils/formatters'
import { Award, BarChart3, ChevronRight, FileText, TrendingUp, Users } from 'lucide-react'

interface AnalyticsTabProps {
  event: Event
  setEvent: Dispatch<SetStateAction<Event | null>>
}

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
  [EventStatus.PUBLISHED]: [
    EventStatus.REGISTRATION_OPEN,
    EventStatus.CANCELLED,
    EventStatus.ARCHIVED
  ],
  [EventStatus.REGISTRATION_OPEN]: [EventStatus.ONGOING, EventStatus.CANCELLED],
  [EventStatus.ONGOING]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
  [EventStatus.COMPLETED]: [EventStatus.ARCHIVED],
  [EventStatus.CANCELLED]: [EventStatus.ARCHIVED],
  [EventStatus.ARCHIVED]: []
}

export const AnalyticsTab = ({ event, setEvent }: AnalyticsTabProps) => {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTransitionModal, setShowTransitionModal] = useState(false)
  const [selectedTargetState, setSelectedTargetState] = useState<EventStatus | null>(null)
  const [error, setError] = useState('')

  const loadAnalytics = async () => {
    if (!event?._id) return
    try {
      const res = await eventsApi.getEventAnalytics(event._id)
      setAnalytics(res.data.data)
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [event?._id])

  const availableTransitions = useMemo(() => VALID_TRANSITIONS[event.status] || [], [event.status])

  const handleTransition = async () => {
    if (!event?._id || !selectedTargetState) return
    setIsTransitioning(true)
    setShowTransitionModal(false)
    setError('')

    try {
      const res = await eventsApi.transitionEvent(event._id, selectedTargetState)
      setEvent(res.data.data)
      setSelectedTargetState(null)
      await loadAnalytics()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsTransitioning(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-gray-600 mt-1">Event Management</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <Badge status={event.status} />
          </div>
        </div>

        {analytics && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Event Analytics</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800 font-medium">Registrations</p>
                </div>
                <p className="text-3xl font-bold text-blue-900">{analytics.totalRegistrations}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">Submissions</p>
                </div>
                <p className="text-3xl font-bold text-green-900">{analytics.totalSubmissions}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-purple-800 font-medium">Conversion Rate</p>
                </div>
                <p className="text-3xl font-bold text-purple-900">{analytics.conversionRate}%</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-orange-800 font-medium">Avg Score</p>
                </div>
                <p className="text-3xl font-bold text-orange-900">
                  {analytics.averageScore !== null ? analytics.averageScore : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Submissions by Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Draft</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.DRAFT / analytics.totalSubmissions) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.DRAFT}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Submitted</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.SUBMITTED / analytics.totalSubmissions) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.SUBMITTED}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Under Review</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.UNDER_REVIEW / analytics.totalSubmissions) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.UNDER_REVIEW}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Accepted</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.ACCEPTED / analytics.totalSubmissions) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.ACCEPTED}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Rejected</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.REJECTED / analytics.totalSubmissions) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.REJECTED}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {availableTransitions.length > 0 && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-4">Event Lifecycle</h3>
            <div className="space-y-3">
              <p className="text-sm text-blue-800 mb-4">
                Current status: <span className="font-semibold">{event.status}</span>
              </p>
              <p className="text-sm text-blue-800 mb-4">Next possible states:</p>
              <div className="flex flex-wrap gap-2">
                {availableTransitions.map((state) => (
                  <button
                    key={state}
                    onClick={() => {
                      setSelectedTargetState(state)
                      setShowTransitionModal(true)
                    }}
                    className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm transition"
                  >
                    {state}
                    <ChevronRight className="inline w-4 h-4 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {availableTransitions.length === 0 && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg mb-8">
            <p className="text-gray-600 text-sm">
              This event has reached its final state ({event.status}) and cannot transition further.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showTransitionModal}
        onClose={() => setShowTransitionModal(false)}
        title="Confirm State Transition"
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to transition this event from{' '}
              <span className="font-semibold">{event.status}</span> to{' '}
              <span className="font-semibold">{selectedTargetState}</span>?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. Please ensure all prerequisites are met for this transition.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTransition}
              disabled={isTransitioning}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium transition"
            >
              {isTransitioning ? 'Transitioning...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowTransitionModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AnalyticsTab
