export enum EventType {
  CONFERENCE = 'CONFERENCE',
  FEST = 'FEST',
  PROGRAM = 'PROGRAM',
  CUSTOM = 'CUSTOM'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

export interface Event {
  _id: string
  title: string
  description: string
  eventType: EventType
  startDate: string | Date
  endDate: string | Date
  createdBy: string
  isPublic: boolean
  status: EventStatus
  hasTeams?: boolean
  hasCategories?: boolean
  hasJudging?: boolean
  hasScoring?: boolean
  hasSubmissions?: boolean
  createdAt?: string
  updatedAt?: string
}

export enum ParticipationRole {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER',
  JUDGE = 'JUDGE'
}

export enum ParticipationStatus {
  REGISTERED = 'REGISTERED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface Participation {
  _id: string
  user: { _id: string; name: string; email: string; role: string }
  event: string
  role: ParticipationRole
  status: ParticipationStatus
  registeredAt: string
  createdAt?: string
  updatedAt?: string
}

export enum ContentType {
  ABSTRACT = 'ABSTRACT',
  PAPER = 'PAPER',
  FILE = 'FILE',
  LINK = 'LINK',
  CUSTOM = 'CUSTOM'
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Submission {
  _id: string
  event: string
  participation: string
  title: string
  description: string
  contentType: ContentType
  status: SubmissionStatus
  content?: string
  submittedAt?: string | null
  files?: any[]
  links?: string[]
  meta?: any
  createdAt?: string
  updatedAt?: string
}

export enum UserRole {
  ORGANIZER = 'ORGANIZER',
  PARTICIPANT = 'PARTICIPANT',
  JUDGE = 'JUDGE'
}

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  success: boolean
  message?: string
  data: {
    accessToken: string
    user: User
  }
}

export interface ApiError {
  message: string
  statusCode?: number
}
