import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { eventsApi, EventAnalytics } from "../api/events.api";
import { Event, EventStatus } from "../types";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { FormBuilder, FormField } from "../components/FormBuilder";
import { AlertCircle, ChevronRight, Users, FileText, TrendingUp, Award, BarChart3 } from "lucide-react";
import { formatDate, getErrorMessage } from "../utils/formatters";
import { Link } from "react-router-dom";

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
  [EventStatus.PUBLISHED]: [
    EventStatus.REGISTRATION_OPEN,
    EventStatus.CANCELLED,
    EventStatus.ARCHIVED,
  ],
  [EventStatus.REGISTRATION_OPEN]: [EventStatus.ONGOING, EventStatus.CANCELLED],
  [EventStatus.ONGOING]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
  [EventStatus.COMPLETED]: [EventStatus.ARCHIVED],
  [EventStatus.CANCELLED]: [EventStatus.ARCHIVED],
  [EventStatus.ARCHIVED]: [],
};

export const EventManagement = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [selectedTargetState, setSelectedTargetState] =
    useState<EventStatus | null>(null);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    isPublic: true,
    registrationStartDate: "",
    registrationEndDate: "",
    registrationForm: [] as FormField[],
    capabilities: {
      registration: false,
      submissions: false,
      review: false,
      teams: false,
      scoring: false,
      sessions: false,
      realtime: false,
    },
  });

  const loadEvent = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const res = await eventsApi.getEvent(eventId);
      const eventData = res.data.data;

      setEvent(eventData);

                                                                                     
      setEditData({
        title: eventData.title,
        description: eventData.description,
        isPublic: eventData.isPublic,
        registrationStartDate: eventData.registrationStartDate
          ? new Date(eventData.registrationStartDate).toISOString().slice(0, 16)
          : "",
        registrationEndDate: eventData.registrationEndDate
          ? new Date(eventData.registrationEndDate).toISOString().slice(0, 16)
          : "",
        registrationForm: eventData.registrationForm || [],
        capabilities: eventData.capabilities,
      });
      setError("");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAnalytics = async () => {
    if (!eventId) return;
    try {
      const res = await eventsApi.getEventAnalytics(eventId);
      setAnalytics(res.data.data);
    } catch (err: any) {
                                                   
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadEvent();
    loadAnalytics();
  }, [eventId]);

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as any;
    setEditData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCapabilityChange = (
    capability: keyof typeof editData.capabilities,
  ) => {
    setEditData((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities[capability],
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!eventId) return;
    setIsEditing(false);
    setError("");

    try {
      const res = await eventsApi.updateEvent(eventId, editData);
      setEvent(res.data.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleTransition = async () => {
    if (!eventId || !selectedTargetState) return;
    setIsTransitioning(true);
    setShowTransitionModal(false);
    setError("");

    try {
      const res = await eventsApi.transitionEvent(eventId, selectedTargetState);
      setEvent(res.data.data);
      setSelectedTargetState(null);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsTransitioning(false);
    }
  };

  if (isLoading)
    return <div className="text-center py-12">Loading event...</div>;
  if (!event)
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-2">Event not found</p>
        <Link
          to="/events"
          className="text-primary-600 hover:text-primary-700 inline-block"
        >
          ← Back to Events
        </Link>
      </div>
    );

  const isCreator = user?._id === event.createdBy;
  if (!isCreator) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-2">Unauthorized</p>
        <p className="text-gray-600 mb-4">
          Only the event creator can manage this event
        </p>
        <Link
          to={`/events/${event._id}`}
          className="text-primary-600 hover:text-primary-700 inline-block"
        >
          ← Back to Event
        </Link>
      </div>
    );
  }

  const availableTransitions = VALID_TRANSITIONS[event.status] || [];

  return (
    <div>
      <Link
        to={`/events/${event._id}`}
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        ← Back to Event
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Event Status & Transitions */}
        <div className="col-span-3 lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {event.title}
                </h2>
                <p className="text-gray-600 mt-1">Event Management</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <Badge status={event.status} />
              </div>
            </div>

            {/* Analytics Section */}
            {analytics && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Event Analytics</h3>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium">Registrations</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{analytics.totalRegistrations}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-800 font-medium">Submissions</p>
                    </div>
                    <p className="text-3xl font-bold text-green-900">{analytics.totalSubmissions}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-purple-800 font-medium">Conversion Rate</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{analytics.conversionRate}%</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-orange-600" />
                      <p className="text-sm text-orange-800 font-medium">Avg Score</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">
                      {analytics.averageScore !== null ? analytics.averageScore : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Submission Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Submissions by Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Draft</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.DRAFT / analytics.totalSubmissions) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.DRAFT}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Submitted</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.SUBMITTED / analytics.totalSubmissions) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.SUBMITTED}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Under Review</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.UNDER_REVIEW / analytics.totalSubmissions) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.UNDER_REVIEW}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Accepted</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.ACCEPTED / analytics.totalSubmissions) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.ACCEPTED}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Rejected</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${analytics.totalSubmissions > 0 ? (analytics.submissionsByStatus.REJECTED / analytics.totalSubmissions) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8">{analytics.submissionsByStatus.REJECTED}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/*  className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {event.title}
                </h2>
                <p className="text-gray-600 mt-1">Event Management</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <Badge status={event.status} />
              </div>
            </div>

            {/* State Transition Section */}
            {availableTransitions.length > 0 && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4">
                  Event Lifecycle
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-blue-800 mb-4">
                    Current status:{" "}
                    <span className="font-semibold">{event.status}</span>
                  </p>
                  <p className="text-sm text-blue-800 mb-4">
                    Next possible states:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableTransitions.map((state) => (
                      <button
                        key={state}
                        onClick={() => {
                          setSelectedTargetState(state);
                          setShowTransitionModal(true);
                        }}
                        className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm transition"
                      >
                        {state}
                        <ChevronRight className="inline w-4 h-4 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {availableTransitions.length === 0 && (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg mb-8">
                <p className="text-gray-600 text-sm">
                  This event has reached its final state ({event.status}) and
                  cannot transition further.
                </p>
              </div>
            )}
          </div>

          {/* Edit Event Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <Input
                  label="Event Title"
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <select
                      name="isPublic"
                      value={editData.isPublic ? "true" : "false"}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          isPublic: e.target.value === "true",
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="true">Public</option>
                      <option value="false">Private</option>
                    </select>
                  </div>
                </div>

                {/* Registration Window - REPLACEMENT BLOCK */}
                {/* Only show if registration capability is enabled */}
                {editData.capabilities.registration && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-blue-900">
                        Registration Window
                      </h4>
                      <p className="text-xs text-blue-700">
                        Required to transition to REGISTRATION_OPEN.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Registration Start Date"
                        type="datetime-local"
                        name="registrationStartDate"
                        value={
                          editData.registrationStartDate &&
                          editData.registrationStartDate.length > 16
                            ? new Date(editData.registrationStartDate)
                                .toISOString()
                                .slice(0, 16)
                            : editData.registrationStartDate
                        }
                        onChange={handleEditChange}
                      />
                      <Input
                        label="Registration End Date"
                        type="datetime-local"
                        name="registrationEndDate"
                        value={
                          editData.registrationEndDate &&
                          editData.registrationEndDate.length > 16
                            ? new Date(editData.registrationEndDate)
                                .toISOString()
                                .slice(0, 16)
                            : editData.registrationEndDate
                        }
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                )}

                {/* Registration Form Builder */}
                {editData.capabilities.registration && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Registration Form
                      </h4>
                      <p className="text-xs text-gray-600">
                        Customize what information to collect from participants during registration.
                      </p>
                    </div>
                    <FormBuilder
                      fields={editData.registrationForm}
                      onChange={(fields) => setEditData(prev => ({ ...prev, registrationForm: fields }))}
                    />
                  </div>
                )}

                <div className="border-t pt-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">
                    Capabilities
                  </p>
                  <div className="space-y-3">
                    {Object.keys(editData.capabilities).map((cap) => (
                      <label key={cap} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            editData.capabilities[
                              cap as keyof typeof editData.capabilities
                            ]
                          }
                          onChange={() =>
                            handleCapabilityChange(
                              cap as keyof typeof editData.capabilities,
                            )
                          }
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-700 capitalize">{cap}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Title</p>
                  <p className="font-semibold text-gray-900">{event.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Visibility</p>
                  <p className="font-semibold">
                    {event.isPublic ? "Public" : "Private"}
                  </p>
                </div>

                {event.registrationStartDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Registration Window
                    </p>
                    <p className="font-semibold">
                      {formatDate(event.registrationStartDate)} —{" "}
                      {formatDate(event.registrationEndDate)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-3">Capabilities</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(event.capabilities).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          disabled
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 capitalize text-sm">
                          {key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Event Info */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4">Event Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                  Event Type
                </p>
                <p className="font-semibold text-gray-900">{event.eventType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                  Start Date
                </p>
                <p className="font-semibold text-gray-900">
                  {formatDate(event.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                  End Date
                </p>
                <p className="font-semibold text-gray-900">
                  {formatDate(event.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="font-semibold text-gray-900">
                  {formatDate(event.createdAt || "")}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  <Link to={`/events/${event._id}`} className="block">
                    <Button variant="secondary" className="w-full text-sm">
                      View Event
                    </Button>
                  </Link>
                  {event.capabilities.submissions && (
                    <Link
                      to={`/events/${event._id}/submissions`}
                      className="block"
                    >
                      <Button variant="secondary" className="w-full text-sm">
                        View Submissions
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Confirmation Modal */}
      <Modal
        isOpen={showTransitionModal}
        onClose={() => setShowTransitionModal(false)}
        title="Confirm State Transition"
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to transition this event from{" "}
              <span className="font-semibold">{event.status}</span> to{" "}
              <span className="font-semibold">{selectedTargetState}</span>?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. Please ensure all prerequisites are
              met for this transition.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTransition}
              disabled={isTransitioning}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium transition"
            >
              {isTransitioning ? "Transitioning..." : "Confirm"}
            </button>
            <button
              onClick={() => setShowTransitionModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventManagement;
