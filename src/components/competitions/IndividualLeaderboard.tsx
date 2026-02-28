import { useEffect, useState } from 'react'
import { Medal } from 'lucide-react'
import { IndividualLeaderboardEntry, participationApi } from '../../api/participation.api'
import { getErrorMessage } from '../../utils/formatters'

interface IndividualLeaderboardProps {
  eventId: string
}

const IndividualLeaderboard = ({ eventId }: IndividualLeaderboardProps) => {
  const [rows, setRows] = useState<IndividualLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await participationApi.getEventLeaderboard(eventId)
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
        <Medal className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Individual Leaderboard</h2>
      </div>

      {isLoading && <p className="text-sm text-gray-600">Loading leaderboard...</p>}

      {!isLoading && error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-8 text-center">
          <p className="text-gray-700 font-medium">No individual scores published yet</p>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200">
                <th className="py-2 pr-4 font-semibold">Rank</th>
                <th className="py-2 pr-4 font-semibold">Participant</th>
                <th className="py-2 pr-4 font-semibold">Team</th>
                <th className="py-2 text-right font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry, index) => {
                const rank = index + 1
                const isTop = rank === 1

                return (
                  <tr
                    key={entry.userId}
                    className={`border-b border-gray-100 last:border-b-0 ${
                      isTop ? 'bg-indigo-50 border-indigo-200' : ''
                    }`}
                  >
                    <td className="py-3 pr-4 font-bold text-gray-900">#{rank}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{entry.name}</p>
                      <p className="text-xs text-gray-500">{entry.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-800">{entry.team}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{entry.individualPoints}</td>
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

export default IndividualLeaderboard
