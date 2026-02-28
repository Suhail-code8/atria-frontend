import axiosInstance from './axios'
import {
  CompetitionGradePoints,
  CompetitionPlacePoints,
  CreateCompetitionItemPayload
} from '../types'

export interface ICategory {
  _id: string
  name: string
  description?: string
}

export interface ICompetitionItem {
  _id: string
  name: string
  type: 'INDIVIDUAL' | 'GROUP' | 'SINGLE'
  allowedCategories: ICategory[]
  minParticipantsPerTeam?: number
  maxParticipantsPerTeam: number
  placePoints?: CompetitionPlacePoints
  gradePoints?: CompetitionGradePoints
}

export interface ICompetitionEntryItem {
  _id?: string
  type?: 'INDIVIDUAL' | 'GROUP' | 'SINGLE'
  name?: string
}

export interface ICompetitionEntryParticipant {
  _id?: string
  id?: string
  name?: string
  email?: string
}

export interface ICompetitionEntry {
  _id: string
  event?: string
  item?: string | ICompetitionEntryItem
  team?: string | { _id?: string; name?: string }
  participants: Array<string | ICompetitionEntryParticipant>
  status?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const competitionApi = {
  createCategory: (eventId: string, data: { name: string; description: string }) =>
    axiosInstance.post<ApiResponse<ICategory>>('/categories', { eventId, ...data }),

  getCategories: (eventId: string) =>
    axiosInstance.get<ApiResponse<ICategory[]>>(`/categories/event/${eventId}`),

  deleteCategory: (categoryId: string) =>
    axiosInstance.delete<ApiResponse<{ deleted: true }>>(`/categories/${categoryId}`),

  createItem: (eventId: string, data: CreateCompetitionItemPayload) =>
    axiosInstance.post<ApiResponse<ICompetitionItem>>('/competition-items', { eventId, ...data }),

  getItems: (eventId: string) =>
    axiosInstance.get<ApiResponse<ICompetitionItem[]>>(`/competition-items/event/${eventId}`),

  getEntriesByItem: (itemId: string) =>
    axiosInstance.get<ApiResponse<ICompetitionEntry[]>>('/entries', {
      params: { item: itemId }
    }),

  getEntriesByEvent: (eventId: string) =>
    axiosInstance.get<ApiResponse<ICompetitionEntry[]>>('/entries', {
      params: { event: eventId }
    }),

  deleteItem: (itemId: string) =>
    axiosInstance.delete<ApiResponse<{ deleted: true }>>(`/competition-items/${itemId}`)
}
