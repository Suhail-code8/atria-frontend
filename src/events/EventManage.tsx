import { useOutletContext, useParams } from 'react-router-dom'
import { EventLayoutOutletContext } from './EventLayout'
import FestSetup from '../components/competitions/FestSetup'
import TeamDashboard from '../components/competitions/TeamDashboard'
import ScoringDashboard from '../components/competitions/ScoringDashboard'
import EventPosterManager from '../components/events/EventPosterManager'
import EditEventForm from '../components/events/EditEventForm'
import AnalyticsTab from '../components/events/AnalyticsTab'
import OrganizerAnnouncements from '../components/announcements/OrganizerAnnouncements'

type ManageTab =
  | 'ANALYTICS_STATUS'
  | 'CONFIGURATION'
  | 'PROMOTION'
  | 'ANNOUNCEMENTS'
  | 'TEAMS'
  | 'SCORING'

export const EventManage = () => {
  const { section } = useParams<{ section?: string }>()
  const { event, setEvent, currentUser } = useOutletContext<EventLayoutOutletContext>()

  const normalizedSection = (section || 'analytics').toLowerCase()

  let activeTab: ManageTab = 'ANALYTICS_STATUS'
  if (normalizedSection === 'configuration') {
    activeTab = 'CONFIGURATION'
  } else if (normalizedSection === 'promotion') {
    activeTab = 'PROMOTION'
  } else if (normalizedSection === 'announcements') {
    activeTab = 'ANNOUNCEMENTS'
  } else if (normalizedSection === 'teams') {
    activeTab = 'TEAMS'
  } else if (normalizedSection === 'scoring') {
    activeTab = 'SCORING'
  }

  if (!currentUser) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <p className="text-sm text-gray-600">Please sign in to manage this event.</p>
      </section>
    )
  }

  return (
    <div className="space-y-6">
        {activeTab === 'ANALYTICS_STATUS' && (
          <AnalyticsTab event={event} setEvent={setEvent} />
        )}

        {activeTab === 'CONFIGURATION' && (
          <>
            <EditEventForm event={event} setEvent={setEvent} />
            <FestSetup
              eventId={event._id}
              title="Configuration"
              subtitle="Create categories and configure competition items."
            />
          </>
        )}

        {activeTab === 'PROMOTION' && (
          <div className="space-y-6">
            <EventPosterManager
              eventId={event._id}
              eventTitle={event.title}
              eventDate={(event as any).date || event.startDate}
              eventLocation={(event as any).location || (event as any).venue}
              eventDescription={event.description}
              initialPosterUrl={event.posterUrl}
            />
          </div>
        )}

        {activeTab === 'ANNOUNCEMENTS' && (
          <OrganizerAnnouncements eventId={event._id} />
        )}

        {activeTab === 'TEAMS' && (
          <TeamDashboard eventId={event._id} currentUser={currentUser} />
        )}

        {activeTab === 'SCORING' && <ScoringDashboard eventId={event._id} />}
    </div>
  )
}

export default EventManage
