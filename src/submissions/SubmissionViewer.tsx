import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { submissionsApi } from '../api/submissions.api'
import { Submission, SubmissionStatus, UserRole } from '../types'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { AlertCircle, ChevronLeft, FileText, Calendar, User, ExternalLink, Award, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { formatDate, getErrorMessage } from '../utils/formatters'
import { useAuth } from '../auth/AuthContext'
import Input from '../components/Input'

const SubmissionViewer = (): JSX.Element => {
  const { eventId, submissionId } = useParams<{ eventId: string; submissionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
                      
  const [score, setScore] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  const isReviewer =
    user?.role === UserRole.ORGANIZER || user?.role === UserRole.JUDGE
  const canReview = isReviewer && submission?.status !== SubmissionStatus.DRAFT

  useEffect(() => {
    loadSubmission()
  }, [eventId, submissionId])

  const loadSubmission = async () => {
    if (!eventId || !submissionId) {
      setError('Invalid submission URL')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await submissionsApi.getSubmission(eventId, submissionId)
      const loadedSubmission = response.data.data
      setSubmission(loadedSubmission)
      
                                                 
      if (loadedSubmission.review) {
        setScore(loadedSubmission.review.score)
        setComment(loadedSubmission.review.comment)
      }
      
      setError('')
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async (status: SubmissionStatus) => {
    if (!eventId || !submissionId) return
    if (score < 0 || score > 100) {
      setError('Score must be between 0 and 100')
      return
    }
    const normalizedComment = comment.trim()
    if (status === SubmissionStatus.REJECTED && !normalizedComment) {
      setError('Comment is required for rejected submissions')
      return
    }

    setIsReviewing(true)
    try {
      const response = await submissionsApi.reviewSubmission(eventId, submissionId, {
        score,
        comment: normalizedComment,
        status
      })
      setSubmission(response.data.data)
      setError('')
      
                             
      alert(`Submission ${status.toLowerCase()} successfully!`)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsReviewing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Submission</h3>
              <p className="text-red-700 mt-1">{error || 'Submission not found'}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate(`/events/${eventId}/submissions`)}
            className="mt-4"
          >
            Back to Submissions
          </Button>
        </div>
      </div>
    )
  }

  const participant = submission.participant as any
  const authorName = participant?.user?.name || 'Unknown'
  const authorEmail = participant?.user?.email || ''

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/events/${eventId}/submissions`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">View Submission</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge status={submission.status}>
              {submission.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Submission Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Metadata Section */}
        <div className="bg-gray-50 border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Author</div>
                <div className="text-sm font-medium text-gray-900">{authorName}</div>
                {authorEmail && (
                  <div className="text-xs text-gray-500">{authorEmail}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="text-sm font-medium text-gray-900">{submission.type}</div>
              </div>
            </div>

            {submission.submittedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Submitted</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(submission.submittedAt)}
                  </div>
                </div>
              </div>
            )}

            {submission.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(submission.createdAt)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {submission.title}
            </h2>
          </div>

          {submission.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{submission.description}</p>
            </div>
          )}

          {submission.content && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                  {submission.content}
                </pre>
              </div>
            </div>
          )}

          {submission.file && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Attached File</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{submission.file.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {(submission.file.size / 1024).toFixed(2)} KB • {submission.file.mimetype}
                      </p>
                    </div>
                  </div>
                  <a
                    href={submission.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View File
                  </a>
                </div>
              </div>
            </div>
          )}

          {submission.metadata && Object.keys(submission.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-xs text-gray-900 overflow-auto">
                  {JSON.stringify(submission.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Review Section */}
        {submission.review && (
          <div className="border-t border-gray-200 bg-blue-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Review Feedback</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg px-4 py-2 border border-blue-200">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="ml-2 text-2xl font-bold text-blue-600">{submission.review.score}/100</span>
                </div>
                <Badge status={submission.status}>
                  {submission.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Reviewer's Comment</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{submission.review.comment}</p>
                  </div>
                </div>
              </div>

              {submission.review.reviewedAt && (
                <p className="text-sm text-gray-500">
                  Reviewed on {formatDate(submission.review.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Organizer Review Panel */}
      {canReview && !submission.review && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Review Submission</h3>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                placeholder="Enter score"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Comment
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide detailed feedback..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleReview(SubmissionStatus.ACCEPTED)}
                disabled={isReviewing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept Submission
              </Button>
              <Button
                onClick={() => handleReview(SubmissionStatus.REJECTED)}
                disabled={isReviewing}
                variant="secondary"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject Submission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review (if already reviewed) */}
      {canReview && submission.review && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Update Review</h3>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                placeholder="Enter score"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Comment
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide detailed feedback..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleReview(SubmissionStatus.ACCEPTED)}
                disabled={isReviewing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Update & Accept
              </Button>
              <Button
                onClick={() => handleReview(SubmissionStatus.REJECTED)}
                disabled={isReviewing}
                variant="secondary"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Update & Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubmissionViewer
