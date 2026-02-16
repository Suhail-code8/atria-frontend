import axiosInstance from './axios'
import { Event, Participation, ParticipationStatus } from '../types'

export const participationApi = {
  registerForEvent: (eventId: string, answers?: Record<string, any>) =>
    axiosInstance.post<{ success: boolean; data: Participation }>(
      `/participation/${eventId}/register`,
      { answers }
    ),
   
  getMyParticipation: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Participation }>(
      `/participation/${eventId}/me`
    ),

  getMyRegistrations: () =>
    axiosInstance.get<{ success: boolean; data: Event[] }>(
      '/participations/me'
    ),

  withdrawFromEvent: (eventId: string) =>
    axiosInstance.post<{ success: boolean; data: Participation }>(
      `/participation/${eventId}/withdraw` 
    ),

  listParticipants: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Participation[] }>(
      `/participation/${eventId}/list`
    ),

  updateParticipationStatus: (participationId: string, status: ParticipationStatus) =>
    axiosInstance.patch<{ success: boolean; data: Participation }>(
      `/participation/${participationId}/status`,
      { status }
    )
}
