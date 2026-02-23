import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { submissionsApi } from '../api/submissions.api'
import { eventsApi } from '../api/events.api'
import { Submission, Event, SubmissionStatus } from '../types'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { AlertCircle, FileText, User, ChevronDown } from 'lucide-react'
import { formatDate, getErrorMessage } from '../utils/formatters'

const OrganizerSubmissions = () => {
  const { eventId } = useParams<{ eventId: string }>()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  
                                   
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    if (!eventId) return
    
    setIsLoading(true)
    try {
                           
      const eventRes = await eventsApi.getEvent(eventId)
      setEvent(eventRes.data.data)
      
                             
      const submissionsRes = await submissionsApi.getEventSubmissions(eventId)
      setSubmissions(submissionsRes.data.data || [])
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (submissionId: string, newStatus: SubmissionStatus) => {
    if (!eventId) return
    
    setUpdatingStatus(submissionId)
    setOpenDropdown(null)
    
    try {
      await submissionsApi.updateSubmissionStatus(eventId, submissionId, newStatus)
      
                           
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId ? { ...sub, status: newStatus } : sub
        )
      )
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusOptions = (currentStatus: SubmissionStatus) => {
    const allStatuses = [
      SubmissionStatus.SUBMITTED,
      SubmissionStatus.UNDER_REVIEW,
      SubmissionStatus.ACCEPTED,
      SubmissionStatus.REJECTED
    ]
    
    return allStatuses.filter((status) => status !== currentStatus)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading submissions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Submissions</h1>
        <p className="text-gray-600 mt-1">{event?.title}</p>
        <p className="text-sm text-gray-500 mt-1">
          Total Submissions: {submissions.length}
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
          <p className="text-gray-600">
            Participants haven't submitted any work for this event yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => {
                  const participant = submission.participant as any
                  const authorName = participant?.user?.name || 'Unknown'
                  const authorEmail = participant?.user?.email || ''
                  
                  return (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/events/${eventId}/submissions/${submission._id}/view`}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          {submission.title}
                        </Link>
                        {submission.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {submission.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {authorName}
                            </div>
                            {authorEmail && (
                              <div className="text-xs text-gray-500">{authorEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{submission.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={submission.status}>
                          {submission.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {submission.submittedAt
                          ? formatDate(submission.submittedAt)
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === submission._id ? null : submission._id
                              )
                            }
                            disabled={updatingStatus === submission._id}
                            className="text-sm"
                          >
                            Change Status
                            <ChevronDown className="w-4 h-4" />
                          </Button>

                          {openDropdown === submission._id && (
                            <>
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                              />
                              
                              {/* Dropdown Menu */}
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                {getStatusOptions(submission.status).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(submission._id, status)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition"
                                  >
                                    {status.replace(/_/g, ' ')}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics */}
      {submissions.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.values(SubmissionStatus).map((status) => {
            const count = submissions.filter((s) => s.status === status).length
            return (
              <div key={status} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {status.replace(/_/g, ' ')}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrganizerSubmissions
