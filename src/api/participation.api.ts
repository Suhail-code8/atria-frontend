import axiosInstance from './axios'
import { Event, Participation, ParticipationStatus } from '../types'

export interface IndividualLeaderboardEntry {
  userId: string
  name: string
  email?: string
  team: string
  individualPoints: number
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

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
    ),

  getEventLeaderboard: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: IndividualLeaderboardEntry[] }>(
      `/participation/event/${eventId}/leaderboard`
    ),

  verifyPayment: (payload: VerifyPaymentPayload) =>
    axiosInstance.post<{ success: boolean; message?: string; data?: unknown }>(
      '/participation/verify-payment',
      payload
    ),

  getPaymentStatus: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Participation }>(
      `/participation/${eventId}/payment-status`
    ),

  retryPayment: (eventId: string) =>
    axiosInstance.post<{ success: boolean; message?: string; data: Participation }>(
      `/participation/${eventId}/retry-payment`
    )
}
