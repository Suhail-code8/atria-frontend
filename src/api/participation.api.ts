import axiosInstance from './axios'
import { Participation, ParticipationStatus } from '../types'

export const participationApi = {
  registerForEvent: (eventId: string) =>
    axiosInstance.post<{ success: boolean; data: Participation }>(
      `/events/${eventId}/register`
    ),

  listParticipants: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Participation[] }>(
      `/events/${eventId}/participants`
    ),

  getMyParticipation: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Participation | null }>(
      `/events/${eventId}/my-participation`
    ),

  updateParticipationStatus: (eventId: string, participationId: string, status: ParticipationStatus) =>
    axiosInstance.patch<{ success: boolean; data: Participation }>(
      `/events/${eventId}/participants/${participationId}`,
      { status }
    )
}
