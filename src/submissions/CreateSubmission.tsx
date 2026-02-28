import { useState } from 'react'
import { submissionsApi } from '../api/submissions.api'
import { ContentType } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import { AlertCircle } from 'lucide-react'
import { getErrorMessage } from '../utils/formatters'

interface CreateSubmissionFormProps {
  eventId: string
  onSuccess: () => void
}

const CONTENT_TYPES = [
  { value: 'ABSTRACT', label: 'Abstract' },
  { value: 'PAPER', label: 'Paper' },
  { value: 'FILE', label: 'File Upload' },
  { value: 'LINK', label: 'Link' },
  { value: 'CUSTOM', label: 'Custom' }
]

const CreateSubmissionForm = ({ eventId, onSuccess }: CreateSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CUSTOM' as ContentType
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await submissionsApi.createSubmission(eventId, formData)
      onSuccess()
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Input
        label="Title"
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
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {CONTENT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create Submission
        </Button>
      </div>
    </form>
  )
}

export default CreateSubmissionForm
