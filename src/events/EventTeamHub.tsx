import { useOutletContext } from 'react-router-dom'
import { EventLayoutOutletContext } from './EventLayout'
import TeamDashboard from '../components/competitions/TeamDashboard'

export const EventTeamHub = () => {
  const { event, currentUser } = useOutletContext<EventLayoutOutletContext>()

  if (!currentUser) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <p className="text-sm text-gray-600">Please sign in to access Team Hub.</p>
      </section>
    )
  }

  return (
    <TeamDashboard eventId={event._id} currentUser={currentUser} />
  )
}

export default EventTeamHub
