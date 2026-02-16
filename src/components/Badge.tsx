import { EventStatus, SubmissionStatus, ParticipationStatus } from '../types'

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info'

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case EventStatus.PUBLISHED:
    case SubmissionStatus.SUBMITTED:
    case ParticipationStatus.REGISTERED:
      return 'bg-blue-100 text-blue-800'
    case EventStatus.REGISTRATION_OPEN:
    case SubmissionStatus.UNDER_REVIEW:
      return 'bg-purple-100 text-purple-800'
    case EventStatus.ONGOING:
    case SubmissionStatus.ACCEPTED:
    case ParticipationStatus.APPROVED:
      return 'bg-green-100 text-green-800'
    case EventStatus.CANCELLED:
    case SubmissionStatus.REJECTED:
    case ParticipationStatus.REJECTED:
      return 'bg-red-100 text-red-800'
    case SubmissionStatus.DRAFT:
      return 'bg-yellow-100 text-yellow-800'
    case EventStatus.DRAFT:
    case EventStatus.COMPLETED:
    case EventStatus.ARCHIVED:
    case ParticipationStatus.WITHDRAWN:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const variantColors: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
  info: 'bg-blue-100 text-blue-800'
}

interface BadgeProps {
  status?: string
  label?: string
  variant?: BadgeVariant
  children?: React.ReactNode
}

const Badge = ({ status, label, variant, children }: BadgeProps) => {
  const colorClass = variant
    ? variantColors[variant]
    : status
      ? getStatusBadgeColor(status)
      : 'bg-gray-100 text-gray-800'

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {children || label || status || 'N/A'}
    </span>
  )
}

export default Badge
