import axiosInstance from './axios'

export type TeamRole = 'MANAGER' | 'ASST_MANAGER' | 'CAPTAIN' | 'MEMBER'

export interface ITeamMember {
  user: any
  role: TeamRole
  category: any
}

export interface ITeam {
  _id: string
  name: string
  event: string
  members: ITeamMember[]
  totalPoints: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const teamApi = {
  createTeam: (eventId: string, name: string, managerEmail: string) =>
    axiosInstance.post<ApiResponse<ITeam>>('/teams', { eventId, name, managerEmail }),

  addMember: (teamId: string, email: string, role: string, categoryId: string) =>
    axiosInstance.post<ApiResponse<ITeam>>(`/teams/${teamId}/members`, {
      email,
      role,
      categoryId
    }),

  getEventTeams: (eventId: string) =>
    axiosInstance.get<ApiResponse<ITeam[]>>(`/teams/event/${eventId}`)
}
