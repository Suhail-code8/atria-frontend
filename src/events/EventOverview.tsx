import { useOutletContext } from 'react-router-dom'
import { EventLayoutOutletContext } from './EventLayout'
import Leaderboard from '../components/competitions/Leaderboard'
import IndividualLeaderboard from '../components/competitions/IndividualLeaderboard'

export const EventOverview = () => {
  const { event, currentUser } = useOutletContext<EventLayoutOutletContext>()

  const eventCreatorId =
    typeof event.createdBy === 'string'
      ? event.createdBy
      : (event.createdBy as any)?._id
  const isEventCreator = currentUser?._id === eventCreatorId

  const canViewLeaderboard = event.isLeaderboardPublished === true || isEventCreator
  const showLeaderboardSection = event.isCompetition === true && event.capabilities.scoring === true

  return (
    <div className="space-y-8">
      {showLeaderboardSection &&
        (canViewLeaderboard ? (
          <div className="space-y-8">
            <Leaderboard eventId={event._id} />
            <IndividualLeaderboard eventId={event._id} showEmail={isEventCreator} />
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center my-8">
            <span className="text-4xl block mb-3">🔒</span>
            <h3 className="text-xl font-bold text-gray-900">Leaderboards Hidden</h3>
          </div>
        ))}
    </div>
  )
}

export default EventOverview
