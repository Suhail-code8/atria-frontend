import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { TeamLeaderboardEntry, resultApi } from '../../api/result.api'
import { getErrorMessage } from '../../utils/formatters'

interface LeaderboardProps {
  eventId: string
}

const Leaderboard = ({ eventId }: LeaderboardProps) => {
  const [rows, setRows] = useState<TeamLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await resultApi.getTeamLeaderboard(eventId)
        setRows(response.data.data)
      } catch (err: unknown) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboard()
  }, [eventId])

  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">Team Leaderboard</h2>
      </div>

      {isLoading && <p className="text-sm text-gray-600">Loading leaderboard...</p>}

      {!isLoading && error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-8 text-center">
          <p className="text-gray-700 font-medium">No scores published yet</p>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200">
                <th className="py-2 pr-4 font-semibold">Rank</th>
                <th className="py-2 pr-4 font-semibold">Team Name</th>
                <th className="py-2 text-right font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((team, index) => {
                const rank = index + 1
                const isTop = rank === 1

                return (
                  <tr
                    key={team._id}
                    className={`border-b border-gray-100 last:border-b-0 ${
                      isTop ? 'bg-yellow-50 border-yellow-200' : ''
                    }`}
                  >
                    <td className="py-3 pr-4 font-bold text-gray-900">#{rank}</td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{team.name}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{team.totalPoints}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Leaderboard
