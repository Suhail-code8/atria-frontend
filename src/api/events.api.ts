import axiosInstance from './axios'
import { Event, EventStatus } from '../types'

export interface EventAnalytics {
  totalRegistrations: number
  totalSubmissions: number
  conversionRate: number
  registrationsByDate: Array<{ date: string; count: number }>
  submissionsByStatus: {
    DRAFT: number
    SUBMITTED: number
    UNDER_REVIEW: number
    ACCEPTED: number
    REJECTED: number
  }
  averageScore: number | null
  reviewedCount: number
}

export const eventsApi = {
  listEvents: () =>
    axiosInstance.get<{ success: boolean; data: Event[] }>('/events'),

  getMyEvents: () =>
    axiosInstance.get<{ success: boolean; data: Event[] }>('/events?organizerId=ME'),

  getEvent: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Event }>(`/events/${eventId}`),

  createEvent: (data: Partial<Event>) =>
    axiosInstance.post<{ success: boolean; data: Event }>('/events', data),

  updateEvent: (eventId: string, data: Partial<Event>) =>
    axiosInstance.put<{ success: boolean; data: Event }>(`/events/${eventId}`, data),

  deleteEvent: (eventId: string) =>
    axiosInstance.delete<{ success: boolean; data: Event }>(`/events/${eventId}`),

  transitionEvent: (eventId: string, targetState: EventStatus) =>
    axiosInstance.post<{ success: boolean; message: string; data: Event }>(
      `/events/${eventId}/transition`,
      { targetState }
    ),

  getEventAnalytics: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: EventAnalytics }>(
      `/events/${eventId}/analytics`
    )
}
