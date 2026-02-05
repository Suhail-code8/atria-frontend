import axiosInstance from './axios'
import { Submission } from '../types'

export const submissionsApi = {
  getSubmission: (eventId: string, submissionId: string) =>
    axiosInstance.get<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}`
    ),

  createSubmission: (eventId: string, data: Partial<Submission>) =>
    axiosInstance.post<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions`,
      data
    ),

  updateSubmission: (eventId: string, submissionId: string, data: Partial<Submission>) =>
    axiosInstance.put<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}`,
      data
    ),

  submitSubmission: (eventId: string, submissionId: string) =>
    axiosInstance.post<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}/submit`
    ),

  listMySubmissions: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Submission[] }>(
      `/events/${eventId}/my-submissions`
    ),

  listSubmissions: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Submission[] }>(
      `/events/${eventId}/submissions`
    )
}
