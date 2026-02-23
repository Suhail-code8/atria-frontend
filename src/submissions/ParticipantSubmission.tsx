import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { submissionsApi } from '../api/submissions.api'
import { eventsApi } from '../api/events.api'
import { Submission, Event, SubmissionStatus, ContentType } from '../types'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { AlertCircle, Plus, FileText, Calendar, Upload } from 'lucide-react'
import { formatDate, getErrorMessage } from '../utils/formatters'

const ParticipantSubmission = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
                                       
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ContentType.ABSTRACT,
    content: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    if (!eventId) return
    
    setIsLoading(true)
    try {
                           
      const eventRes = await eventsApi.getEvent(eventId)
      setEvent(eventRes.data.data)
      
                               
      try {
        const submissionRes = await submissionsApi.getMySubmission(eventId)
                                                 
        const data = submissionRes.data.data
        if (Array.isArray(data) && data.length > 0) {
          setSubmission(data[0])
        } else if (data && !Array.isArray(data)) {
          setSubmission(data as any)
        } else {
          setSubmission(null)
        }
      } catch (err: any) {
                                             
        if (err.response?.status === 404 || err.response?.status === 403) {
          setSubmission(null)
        } else {
          throw err
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return
    
    setCreateError('')
    setIsCreating(true)
    
    try {
      const dataToSubmit: any = { ...formData }
      
                             
      if (selectedFile) {
        dataToSubmit.file = selectedFile
      }
      
      const res = await submissionsApi.createSubmission(eventId, dataToSubmit)
      setSubmission(res.data.data)
      setShowCreateModal(false)
                   
      setFormData({
        title: '',
        description: '',
        type: ContentType.ABSTRACT,
        content: ''
      })
      setSelectedFile(null)
    } catch (err: any) {
      setCreateError(getErrorMessage(err))
    } finally {
      setIsCreating(false)
    }
  }

  const handleSubmissionClick = () => {
    if (submission) {
      navigate(`/events/${eventId}/submission/edit?id=${submission._id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
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

  const canCreateSubmission = event?.capabilities?.submissions === true

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Submission</h1>
          <p className="text-gray-600 mt-1">{event?.title}</p>
        </div>
        
        {!submission && canCreateSubmission && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Submission
          </Button>
        )}
      </div>

      {!canCreateSubmission && !submission && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">
              This event does not allow submissions.
            </p>
          </div>
        </div>
      )}

      {canCreateSubmission && !submission && (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submission Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your submission to participate in this event.
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Create Submission
          </Button>
        </div>
      )}

      {submission && (
        <div
          onClick={handleSubmissionClick}
          className="bg-white rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {submission.title}
              </h2>
              {submission.description && (
                <p className="text-gray-600 mb-3">{submission.description}</p>
              )}
            </div>
            <Badge status={submission.status}>
              {submission.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Type: {submission.type}</span>
            </div>
            {submission.file && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>File: {submission.file.originalName}</span>
              </div>
            )}
            {submission.submittedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Submitted: {formatDate(submission.submittedAt)}</span>
              </div>
            )}
          </div>

          {submission.status === SubmissionStatus.DRAFT && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Click to edit and submit your draft
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Submission Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setCreateError('')
        }}
        title="Create New Submission"
        size="lg"
      >
        <form onSubmit={handleCreateSubmission} className="space-y-4">
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{createError}</p>
            </div>
          )}

          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter submission title"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Brief description or abstract"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.values(ContentType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Input: File or Text Content */}
          {formData.type === ContentType.FILE ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0])
                    }
                  }}
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload-create"
                />
                <label
                  htmlFor="file-upload-create"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition"
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Choose file to upload'}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOCX, ZIP, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content / Link
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={formData.type === ContentType.LINK ? "Enter URL here" : "Enter your submission content"}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false)
                setCreateError('')
                setSelectedFile(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              disabled={!formData.title}
            >
              Create Draft
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ParticipantSubmission