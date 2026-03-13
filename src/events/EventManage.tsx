import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { EventLayoutOutletContext } from './EventLayout'
import FestSetup from '../components/competitions/FestSetup'
import TeamDashboard from '../components/competitions/TeamDashboard'
import ScoringDashboard from '../components/competitions/ScoringDashboard'
import Leaderboard from '../components/competitions/Leaderboard'
import IndividualLeaderboard from '../components/competitions/IndividualLeaderboard'
import EventPosterManager from '../components/events/EventPosterManager'
import EditEventForm from '../components/events/EditEventForm'
import AnalyticsTab from '../components/events/AnalyticsTab'
import OrganizerAnnouncements from '../components/announcements/OrganizerAnnouncements'
import { UserRole } from '../types'

type ManageTab =
  | 'ANALYTICS_STATUS'
  | 'CONFIGURATION'
  | 'PROMOTION'
  | 'ANNOUNCEMENTS'
  | 'TEAMS'
  | 'SCORING'
  | 'LEADERBOARD'

export const EventManage = () => {
  const { section } = useParams<{ section?: string }>()
  const { event, setEvent, currentUser, refreshEvent } = useOutletContext<EventLayoutOutletContext>()
  const isCompetitionEvent =
    event.isCompetition === true ||
    event.capabilities.teams === true ||
    event.capabilities.scoring === true
  const eventCreatorId =
    typeof event.createdBy === 'string'
      ? event.createdBy
      : (event.createdBy as any)?._id
  const canManageEvent = currentUser?.role === UserRole.ORGANIZER && currentUser?._id === eventCreatorId

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
  } else if (normalizedSection === 'leaderboard') {
    activeTab = 'LEADERBOARD'
  }

  if (!currentUser) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <p className="text-sm text-gray-600">Please sign in to manage this event.</p>
      </section>
    )
  }

  if (!canManageEvent) {
    return <Navigate to={`/events/${event._id}`} replace />
  }

  if (
    !isCompetitionEvent &&
    (activeTab === 'TEAMS' || activeTab === 'SCORING' || activeTab === 'LEADERBOARD')
  ) {
    return <Navigate to={`/events/${event._id}/manage/configuration`} replace />
  }

  return (
    <div className="space-y-6">
        {activeTab === 'ANALYTICS_STATUS' && (
          <AnalyticsTab event={event} setEvent={setEvent} />
        )}

        {activeTab === 'CONFIGURATION' && (
          <>
            <EditEventForm event={event} setEvent={setEvent} />
            {isCompetitionEvent && (
              <FestSetup
                eventId={event._id}
                title="Configuration"
                subtitle="Create categories and configure competition items."
                onDataChanged={refreshEvent}
              />
            )}
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

        {isCompetitionEvent && activeTab === 'TEAMS' && (
          <TeamDashboard eventId={event._id} currentUser={currentUser} event={event} onDataChanged={refreshEvent} />
        )}

        {isCompetitionEvent && activeTab === 'SCORING' && <ScoringDashboard eventId={event._id} onDataChanged={refreshEvent} />}

        {isCompetitionEvent && activeTab === 'LEADERBOARD' && (
          <div className="space-y-8">
            <Leaderboard eventId={event._id} />
            <IndividualLeaderboard eventId={event._id} showEmail />
          </div>
        )}
    </div>
  )
}

export default EventManage
