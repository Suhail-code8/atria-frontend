import axiosInstance from './axios'

export enum AnnouncementPriority {
  INFO = 'INFO',
  WARNING = 'WARNING',
  URGENT = 'URGENT'
}

export interface IAnnouncement {
  _id: string
  title: string
  content: string
  priority: AnnouncementPriority
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const announcementApi = {
  getForEvent: (eventId: string) =>
    axiosInstance.get<ApiResponse<IAnnouncement[]>>(`/announcements/${eventId}`),

  create: (
    eventId: string,
    data: { title: string; content: string; priority: AnnouncementPriority }
  ) => axiosInstance.post<ApiResponse<IAnnouncement>>(`/announcements/${eventId}`, data),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<{ deleted: true }>>(`/announcements/${id}`)
}
