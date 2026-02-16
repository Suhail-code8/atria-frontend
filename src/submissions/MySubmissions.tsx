import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { submissionsApi } from '../api/submissions.api'
import { Submission } from '../types'
import Badge from '../components/Badge'
import Button from '../components/Button'
// import Loader from '../components/Loader'
import Modal from '../components/Modal'
import { AlertCircle, Plus } from 'lucide-react'
import { getErrorMessage, formatDate } from '../utils/formatters'
import { Link } from 'react-router-dom'
import CreateSubmissionForm from './CreateSubmission'

export const MySubmissions = () => {
  const { id } = useParams<{ id: string }>()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [id])

  const loadSubmissions = async () => {
    if (!id) return
    try {
      const res = await submissionsApi.getMySubmission(id)
      setSubmissions(res.data.data)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmissionCreated = () => {
    setShowCreateModal(false)
    loadSubmissions()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          New Submission
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <Link key={sub._id} to={`/events/${id}/my-submissions/${sub._id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{sub.title}</h3>
                    <p className="text-gray-600 text-sm">{sub.description}</p>
                  </div>
                  <Badge status={sub.status} />
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Type: {sub.type}</span>
                  {sub.submittedAt && <span>Submitted: {formatDate(sub.submittedAt)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Submission"
        size="lg"
      >
        <CreateSubmissionForm
          eventId={id || ''}
          onSuccess={handleSubmissionCreated}
        />
      </Modal>
    </div>
  )
}

export default MySubmissions
