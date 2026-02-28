export enum EventType {
  CONFERENCE = 'CONFERENCE',
  FEST = 'FEST',
  PROGRAM = 'PROGRAM',
  CUSTOM = 'CUSTOM'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED'
}

export interface EventCapabilities {
  registration: boolean
  submissions: boolean
  review: boolean
  teams: boolean
  scoring: boolean
  leaderboardPublished?: boolean
  sessions: boolean
  realtime: boolean
}

export interface EventLimits {
  maxCategoriesPerTeam?: number
  maxParticipantsPerCategoryPerTeam?: number
  maxItemsPerTeam?: number
  maxIndividualItemsPerParticipant?: number
}

export interface EventScoringRules {
  places?: Record<string, number>
  grades?: Record<string, number>
}

export interface CompetitionPlacePoints {
  first: number
  second: number
  third: number
}

export interface CompetitionGradePoints {
  a: number
  b: number
  c: number
}

export interface CompetitionItem {
  _id: string
  name: string
  type: 'INDIVIDUAL' | 'GROUP' | 'SINGLE'
  allowedCategories: Array<{ _id: string; name: string; description?: string }>
  minParticipantsPerTeam?: number
  maxParticipantsPerTeam: number
  placePoints?: CompetitionPlacePoints
  gradePoints?: CompetitionGradePoints
}

export interface CreateCompetitionItemPayload {
  name: string
  type: 'INDIVIDUAL' | 'GROUP' | 'SINGLE'
  allowedCategories?: string[]
  minParticipantsPerTeam?: number
  maxParticipantsPerTeam?: number
  placePoints?: CompetitionPlacePoints
  gradePoints?: CompetitionGradePoints
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface Event {
  _id: string
  title: string
  description: string
  posterUrl?: string
  eventType: EventType
  isCompetition?: boolean
  isLeaderboardPublished?: boolean
  startDate: string | Date
  endDate: string | Date
  registrationStartDate?: string | Date
  registrationEndDate?: string | Date
  createdBy: string
  isPublic: boolean
  status: EventStatus
  capabilities: EventCapabilities
  scoringRules?: EventScoringRules
  limits?: EventLimits
  registrationForm?: FormField[]
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
  answers?: Record<string, any>
  metadata?: Record<string, any>
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
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface SubmissionFile {
  publicId: string
  url: string
  originalName: string
  mimetype: string
  size: number
}

export interface SubmissionReview {
  score: number         
  comment: string
  feedbackFile?: {
    publicId: string
    url: string
  }
  reviewedBy: string | { _id: string; name: string; email: string }
  reviewedAt: string | Date
}

export interface Submission {
  _id: string
  event: string
  participant: string
  title: string
  description?: string
  type: ContentType
  status: SubmissionStatus
  content?: string
  file?: SubmissionFile
  review?: SubmissionReview
  submittedAt?: string | null
  metadata?: Record<string, any>
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
