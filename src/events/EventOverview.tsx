import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { teamApi, ITeam } from '../api/team.api'
import { EventLayoutOutletContext } from './EventLayout'
import { UserRole } from '../types'
import Leaderboard from '../components/competitions/Leaderboard'
import IndividualLeaderboard from '../components/competitions/IndividualLeaderboard'

export const EventOverview = () => {
  const { event, currentUser } = useOutletContext<EventLayoutOutletContext>()
  const [teams, setTeams] = useState<ITeam[]>([])
  const [teamsLoading, setTeamsLoading] = useState(false)

  useEffect(() => {
    const loadTeams = async () => {
      if (event.capabilities.teams !== true) {
        setTeams([])
        return
      }

      setTeamsLoading(true)
      try {
        const response = await teamApi.getEventTeams(event._id)
        setTeams(response.data.data)
      } catch {
        setTeams([])
      } finally {
        setTeamsLoading(false)
      }
    }

    loadTeams()
  }, [event._id, event.capabilities.teams])

  const isOrganizer = currentUser?.role === UserRole.ORGANIZER

  const canViewLeaderboard = event.isLeaderboardPublished === true || isOrganizer
  const showLeaderboardSection = event.isCompetition === true && event.capabilities.scoring === true

  return (
    <div className="space-y-8">
      {event.capabilities.teams === true && (
        <section className="bg-white rounded-xl shadow p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Participating Teams</h3>
          {teamsLoading ? (
            <p className="text-sm text-gray-600">Loading teams...</p>
          ) : teams.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <p className="text-gray-700 font-medium">No teams have registered yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <article key={team._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900">{team.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Points: {team.totalPoints}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {showLeaderboardSection &&
        (canViewLeaderboard ? (
          <div className="space-y-8">
            <Leaderboard eventId={event._id} />
            <IndividualLeaderboard eventId={event._id} />
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center my-8">
            <span className="text-4xl block mb-3">🔒</span>
            <h3 className="text-xl font-bold text-gray-900">Leaderboards Hidden</h3>
            <p className="text-gray-600 mt-2">The organizer has hidden the live scores to build suspense. Check back after the final results are announced!</p>
          </div>
        ))}
    </div>
  )
}

export default EventOverview
