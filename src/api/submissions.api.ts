import axiosInstance from './axios'
import { Submission, SubmissionStatus } from '../types'

                                              
const toFormData = (data: any): FormData => {
  const formData = new FormData()
  
  Object.keys(data).forEach((key) => {
    const value = data[key]
    
                                    
    if (value === undefined || value === null) return
    
                          
    if (value instanceof File) {
      formData.append(key, value)
    }
                          
    else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
    }
    else {
      formData.append(key, String(value))
    }
  })
  
  return formData
}

export const submissionsApi = {
                          
  getSubmission: (eventId: string, submissionId: string) =>
    axiosInstance.get<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}`
    ),

  // Get my submission for an event (participant view)
  getMySubmission: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Submission[] }>(
      `/events/${eventId}/submissions/me`
    ),

  // Create a new submission with file upload support
  createSubmission: (eventId: string, data: any) => {
    const formData = toFormData(data)
    return axiosInstance.post<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },

  // Update submission (DRAFT only) with file upload support
  updateSubmission: (eventId: string, submissionId: string, data: any) => {
    const formData = toFormData(data)
    return axiosInstance.put<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },

  // Submit submission (DRAFT -> SUBMITTED)
  submitSubmission: (eventId: string, submissionId: string) =>
    axiosInstance.post<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}/submit`
    ),

  // Get all submissions for event (Organizer/Judge only)
  getEventSubmissions: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: Submission[] }>(
      `/events/${eventId}/submissions`
    ),

  // Update submission status (Organizer/Judge only)
  updateSubmissionStatus: (eventId: string, submissionId: string, status: SubmissionStatus) =>
    axiosInstance.patch<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}/status`,
      { status }
    ),

  // Review/Grade submission (Organizer/Judge only)
  reviewSubmission: (eventId: string, submissionId: string, data: { score: number; comment?: string; status: SubmissionStatus }) =>
    axiosInstance.put<{ success: boolean; data: Submission }>(
      `/events/${eventId}/submissions/${submissionId}/review`,
      data
    )
}
