import { EventStatus, SubmissionStatus, ParticipationStatus } from '../types'

const statusBadgeColors: Record<string, string> = {
  // EventStatus
  'EventStatus.DRAFT': 'bg-gray-100 text-gray-800',
  'EventStatus.PUBLISHED': 'bg-blue-100 text-blue-800',
  'EventStatus.ONGOING': 'bg-green-100 text-green-800',
  'EventStatus.COMPLETED': 'bg-gray-100 text-gray-800',
  // SubmissionStatus
  'SubmissionStatus.DRAFT': 'bg-yellow-100 text-yellow-800',
  'SubmissionStatus.SUBMITTED': 'bg-blue-100 text-blue-800',
  'SubmissionStatus.UNDER_REVIEW': 'bg-purple-100 text-purple-800',
  'SubmissionStatus.APPROVED': 'bg-green-100 text-green-800',
  'SubmissionStatus.REJECTED': 'bg-red-100 text-red-800',
  // ParticipationStatus
  'ParticipationStatus.REGISTERED': 'bg-blue-100 text-blue-800',
  'ParticipationStatus.APPROVED': 'bg-green-100 text-green-800',
  'ParticipationStatus.REJECTED': 'bg-red-100 text-red-800',
  'ParticipationStatus.WITHDRAWN': 'bg-gray-100 text-gray-800',
  // Fallbacks for string values
  [EventStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [EventStatus.PUBLISHED]: 'bg-blue-100 text-blue-800',
  [EventStatus.ONGOING]: 'bg-green-100 text-green-800',
  [EventStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  [SubmissionStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [SubmissionStatus.UNDER_REVIEW]: 'bg-purple-100 text-purple-800',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ParticipationStatus.REGISTERED]: 'bg-blue-100 text-blue-800',
  [ParticipationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800'
}

interface BadgeProps {
  status: string
  children?: React.ReactNode
}

const Badge = ({ status, children }: BadgeProps) => {
  const colorClass = statusBadgeColors[status] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {children || status}
    </span>
  )
}

export default Badge
