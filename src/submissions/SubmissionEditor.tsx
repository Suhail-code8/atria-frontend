import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { submissionsApi } from '../api/submissions.api'
import { Submission, SubmissionStatus } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
// import Loader from '../components/Loader'
import { AlertCircle, ChevronLeft } from 'lucide-react'
import { getErrorMessage } from '../utils/formatters'

interface EditableSubmission {
  title?: string
  description?: string
  content?: string
}

const SubmissionEditor = () => {
  const { eventId, submissionId } = useParams<{ eventId: string; submissionId: string }>()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [editData, setEditData] = useState<EditableSubmission>({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setIsLoading(true)
        const response = await submissionsApi.getSubmission(eventId!, submissionId!)
        const data = response.data.data
        setSubmission(data)
        setEditData({
          title: data.title,
          description: data.description,
          content: data.content || ''
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId && submissionId) {
      loadSubmission()
    }
  }, [eventId, submissionId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!submission) return
    setError('')
    setIsSaving(true)

    try {
      const response = await submissionsApi.updateSubmission(eventId!, submissionId!, editData)
      const updated = response.data.data
      setSubmission(updated)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!submission) return
    setError('')
    setIsSubmitting(true)

    try {
      const response = await submissionsApi.submitSubmission(eventId!, submissionId!)
      const updated = response.data.data
      setSubmission(updated)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center py-12">
  //       {/* <Loader /> */}
  //     </div>
  //   )
  // }

  if (!submission) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Submission not found</p>
        <Button
          variant="secondary"
          onClick={() => navigate(`/events/${eventId}/my-submissions`)}
          className="mt-4"
        >
          Back to Submissions
        </Button>
      </div>
    )
  }

  const isDraft = submission.status === SubmissionStatus.DRAFT
  const canEdit = isDraft

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/events/${eventId}/my-submissions`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{submission.title}</h1>
          <p className="text-gray-600 mt-1">
            {submission.status === SubmissionStatus.DRAFT && 'Draft'}
            {submission.status === SubmissionStatus.SUBMITTED && 'Submitted'}
            {submission.status === SubmissionStatus.UNDER_REVIEW && 'Under Review'}
            {submission.status === SubmissionStatus.APPROVED && 'Approved'}
            {submission.status === SubmissionStatus.REJECTED && 'Rejected'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Read-only Alert for non-drafts */}
      {!isDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            This submission cannot be edited as it has been {submission.status.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <Input
          label="Title"
          type="text"
          name="title"
          value={editData.title || ''}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={editData.description || ''}
            onChange={handleChange}
            disabled={!canEdit}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={editData.content || ''}
            onChange={handleChange}
            disabled={!canEdit}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Draft
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit for Review
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(`/events/${eventId}/my-submissions`)}
          >
            Cancel
          </Button>
        </div>
      )}

      {!canEdit && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => navigate(`/events/${eventId}/my-submissions`)}
          >
            Back to Submissions
          </Button>
        </div>
      )}
    </div>
  )
}

export default SubmissionEditor
