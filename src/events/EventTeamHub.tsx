import { useOutletContext } from 'react-router-dom'
import { EventLayoutOutletContext } from './EventLayout'
import TeamDashboard from '../components/competitions/TeamDashboard'

export const EventTeamHub = () => {
  const { event, currentUser, refreshEvent } = useOutletContext<EventLayoutOutletContext>()
  const isCompetitionEvent =
    event.isCompetition === true ||
    event.capabilities.teams === true ||
    event.capabilities.scoring === true

  if (!currentUser) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <p className="text-sm text-gray-600">Please sign in to access Team Hub.</p>
      </section>
    )
  }

  if (!isCompetitionEvent) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <p className="text-sm text-gray-600">Team hub is available only for competition events.</p>
      </section>
    )
  }

  return (
    <TeamDashboard eventId={event._id} currentUser={currentUser} event={event} onDataChanged={refreshEvent} />
  )
}

export default EventTeamHub
