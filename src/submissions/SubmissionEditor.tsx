import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { submissionsApi } from '../api/submissions.api'
import { Submission, SubmissionStatus, ContentType } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import Badge from '../components/Badge'
import { AlertCircle, ChevronLeft, Lock, Save, Send, Upload, FileText, ExternalLink } from 'lucide-react'
import { getErrorMessage } from '../utils/formatters'

const SubmissionEditor = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const [searchParams] = useSearchParams()
  const submissionId = searchParams.get('id')
  const navigate = useNavigate()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ContentType.ABSTRACT,
    content: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const data = response.data.data
      setSubmission(data)
      setFormData({
        title: data.title,
        description: data.description || '',
        type: data.type,
        content: data.content || ''
      })
      setError('')
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSaveDraft = async () => {
    if (!submission || !eventId || !submissionId) return

    setError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      const dataToSubmit: any = { ...formData }
      
      // Add file if selected
      if (selectedFile) {
        dataToSubmit.file = selectedFile
      }
      
      const response = await submissionsApi.updateSubmission(eventId, submissionId, dataToSubmit)
      const updated = response.data.data
      setSubmission(updated)
      setSelectedFile(null) // Clear file input after successful save
      setSuccessMessage('Draft saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalSubmit = async () => {
    if (!submission || !eventId || !submissionId) return

    if (!window.confirm('Are you sure you want to submit? You cannot edit after submission.')) {
      return
    }

    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await submissionsApi.submitSubmission(eventId, submissionId)
      const updated = response.data.data
      setSubmission(updated)
      setSuccessMessage('Submission submitted successfully! It is now locked for review.')
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-semibold">Submission Not Found</h3>
              <p className="text-red-700 mt-1">{error || 'The submission could not be loaded.'}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate(`/events/${eventId}/submission`)}
            className="mt-4"
          >
            Back to Submission
          </Button>
        </div>
      </div>
    )
  }

  const isDraft = submission.status === SubmissionStatus.DRAFT
  const isReadOnly = !isDraft

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/events/${eventId}/submission`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {isDraft ? 'Edit Submission' : 'View Submission'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge status={submission.status}>
              {submission.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
          <div className="text-green-800">{successMessage}</div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Read-only Banner */}
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-semibold">This submission is locked</p>
            <p className="text-blue-700 text-sm mt-1">
              The submission has been finalized and cannot be edited. Current status: {submission.status.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          disabled={isReadOnly}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description / Abstract
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isReadOnly}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="Brief description or abstract of your submission"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
          >
            {Object.values(ContentType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            disabled={isReadOnly}
            rows={10}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm ${
              isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="Enter your content (text, URL, or file path)"
          />
        </div>

        {/* File Upload - Show when type is FILE */}
        {formData.type === ContentType.FILE && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            
            {/* Current File Display */}
            {submission?.file && !selectedFile && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {submission.file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(submission.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <a
                    href={submission.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            )}

            {/* File Input */}
            {!isReadOnly && (
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={isReadOnly}
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition ${
                    isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {selectedFile
                      ? selectedFile.name
                      : submission?.file
                      ? 'Replace file'
                      : 'Choose file to upload'}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOCX, ZIP, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Only show for DRAFT */}
        {isDraft && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={isSaving}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              disabled={isSaving}
            >
              <Send className="w-4 h-4" />
              Final Submit
            </Button>
          </div>
        )}

        {/* Metadata Display (if exists) */}
        {submission.metadata && Object.keys(submission.metadata).length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(submission.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubmissionEditor
