import axiosInstance from './axios'
import { Event } from '../types'

export const eventsApi = {
  listEvents: () =>
    axiosInstance.get<{ success: boolean; data: Event[] }>('/events'),

  getEvent: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Event }>(`/events/${eventId}`),

  createEvent: (data: Partial<Event>) =>
    axiosInstance.post<{ success: boolean; data: Event }>('/events', data),

  updateEvent: (eventId: string, data: Partial<Event>) =>
    axiosInstance.put<{ success: boolean; data: Event }>(`/events/${eventId}`, data),

  deleteEvent: (eventId: string) =>
    axiosInstance.delete<{ success: boolean; data: Event }>(`/events/${eventId}`)
}
