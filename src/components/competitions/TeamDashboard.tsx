import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AlertCircle, Plus, Users } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import Badge from '../Badge'
import Modal from '../Modal'
import axiosInstance from '../../api/axios'
import {
  ICategory,
  ICompetitionEntry,
  ICompetitionItem,
  competitionApi
} from '../../api/competition.api'
import { eventsApi } from '../../api/events.api'
import { ITeam, TeamRole, teamApi } from '../../api/team.api'
import { UserRole } from '../../types'
import { getErrorMessage } from '../../utils/formatters'

interface TeamDashboardProps {
  eventId: string
  currentUser: any
}

const TeamDashboard = ({ eventId, currentUser }: TeamDashboardProps) => {
  const { refreshEvent } = useOutletContext<any>()
  const [teams, setTeams] = useState<ITeam[]>([])
  const [myTeam, setMyTeam] = useState<ITeam | null>(null)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [items, setItems] = useState<ICompetitionItem[]>([])
  const [eventEntries, setEventEntries] = useState<ICompetitionEntry[]>([])
  const [maxIndividualItemsPerParticipant, setMaxIndividualItemsPerParticipant] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [teamName, setTeamName] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)

  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState<TeamRole>('MEMBER')
  const [memberCategoryId, setMemberCategoryId] = useState('')
  const [isAddingMember, setIsAddingMember] = useState(false)

  const [selectedItemId, setSelectedItemId] = useState('')
  const [itemEntries, setItemEntries] = useState<ICompetitionEntry[]>([])
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [slotSelections, setSlotSelections] = useState<string[]>([])
  const [isLoadingItemEntries, setIsLoadingItemEntries] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const currentUserId = currentUser?._id as string | undefined
  const isOrganizer = currentUser?.role === UserRole.ORGANIZER

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [teamsRes, categoriesRes, itemsRes, entriesRes, eventRes] = await Promise.all([
        teamApi.getEventTeams(eventId),
        competitionApi.getCategories(eventId),
        competitionApi.getItems(eventId),
        competitionApi.getEntriesByEvent(eventId),
        eventsApi.getEvent(eventId)
      ])

      const fetchedTeams = teamsRes.data.data
      const fetchedCategories = categoriesRes.data.data
      const fetchedItems = itemsRes.data.data
      const fetchedEntries = entriesRes.data.data

      setTeams(fetchedTeams)
      setCategories(fetchedCategories)
      setItems(fetchedItems)
      setEventEntries(fetchedEntries)
      setMaxIndividualItemsPerParticipant(
        eventRes.data.data.limits?.maxIndividualItemsPerParticipant ?? null
      )

      if (fetchedItems.length > 0 && !selectedItemId) {
        setSelectedItemId(fetchedItems[0]._id)
      }

      if (!currentUserId) {
        setMyTeam(null)
      } else {
        const matchedTeam = fetchedTeams.find((team) =>
          team.members.some((member) => {
            const memberUser = member.user
            const memberUserId =
              typeof memberUser === 'string'
                ? memberUser
                : memberUser?._id || memberUser?.id

            return memberUserId === currentUserId
          })
        ) || null

        setMyTeam(matchedTeam)
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventId, currentUserId])

  const selectedItem = useMemo(
    () => items.find((item) => item._id === selectedItemId) || null,
    [items, selectedItemId]
  )

  const selectedItemType = (selectedItem?.type || '') as string
  const isIndividualItem = selectedItemType === 'INDIVIDUAL' || selectedItemType === 'SINGLE'

  const allowedCategoryIds = useMemo(() => {
    if (!selectedItem || !selectedItem.allowedCategories?.length) {
      return new Set<string>()
    }

    return new Set(
      selectedItem.allowedCategories
        .map((category) => (typeof category === 'string' ? category : category?._id))
        .filter(Boolean) as string[]
    )
  }, [selectedItem])

  const getMemberCategoryId = (member: ITeam['members'][number]) => {
    if (!member.category) return ''
    if (typeof member.category === 'string') return member.category
    return member.category?._id || member.category?.id || ''
  }

  const getMemberName = (member: ITeam['members'][number]) => {
    if (typeof member.user === 'string') return member.user
    return member.user?.name || member.user?._id || member.user?.id || 'Unknown'
  }

  const getMemberId = (member: ITeam['members'][number]) => {
    if (typeof member.user === 'string') return member.user
    return member.user?._id || member.user?.id || ''
  }

  const getMemberCategory = (member: ITeam['members'][number]) => {
    if (!member.category) return '—'
    if (typeof member.category === 'string') return member.category
    return member.category?.name || member.category?._id || '—'
  }

  const eligibleMembers = useMemo(() => {
    if (!myTeam) return []
    if (!allowedCategoryIds.size) return myTeam.members

    return myTeam.members.filter((member) => {
      const categoryId = getMemberCategoryId(member)
      return categoryId ? allowedCategoryIds.has(categoryId) : false
    })
  }, [myTeam, allowedCategoryIds])

  const individualItemsCountByParticipant = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const entry of eventEntries) {
      const item = entry.item
      const itemType = typeof item === 'string' ? '' : item?.type || ''
      if (itemType !== 'INDIVIDUAL' && itemType !== 'SINGLE') {
        continue
      }

      for (const participant of entry.participants || []) {
        const participantId =
          typeof participant === 'string'
            ? participant
            : participant?._id || participant?.id || ''

        if (!participantId) continue

        counts[participantId] = (counts[participantId] || 0) + 1
      }
    }

    return counts
  }, [eventEntries])

  const isParticipantAtLimit = (participantId: string) => {
    if (!participantId || !isIndividualItem) return false
    if (!maxIndividualItemsPerParticipant || maxIndividualItemsPerParticipant <= 0) return false

    return (individualItemsCountByParticipant[participantId] || 0) >= maxIndividualItemsPerParticipant
  }

  const minParticipantsRequired =
    selectedItem?.minParticipantsPerTeam ?? (selectedItem as any)?.minParticipants ?? 1
  const maxParticipantsAllowed =
    selectedItem?.maxParticipantsPerTeam ?? (selectedItem as any)?.maxParticipants ?? 1

  const getEntryParticipantId = (participant: ICompetitionEntry['participants'][number]) =>
    typeof participant === 'string'
      ? participant
      : participant?._id || participant?.id || ''

  const getEntryTeamId = (entry: ICompetitionEntry) =>
    typeof entry.team === 'string' ? entry.team : entry.team?._id || ''

  const selectedParticipantIds = useMemo(
    () => Array.from(new Set(slotSelections.filter(Boolean))),
    [slotSelections]
  )

  const enrolledParticipantIdsForTeamItem = useMemo(() => {
    if (!myTeam || !selectedItemId) {
      return new Set<string>()
    }

    const ids = itemEntries
      .filter((entry) => getEntryTeamId(entry) === myTeam._id)
      .flatMap((entry) => (entry.participants || []).map((participant) => getEntryParticipantId(participant)))
      .filter(Boolean)

    return new Set(ids)
  }, [itemEntries, myTeam, selectedItemId])

  const enrolledMembersForTeamItem = useMemo(() => {
    if (!myTeam) return []

    return myTeam.members.filter((member) => {
      const memberId = getMemberId(member)
      return memberId ? enrolledParticipantIdsForTeamItem.has(memberId) : false
    })
  }, [myTeam, enrolledParticipantIdsForTeamItem])

  const availableEligibleMembers = useMemo(
    () =>
      eligibleMembers.filter((member) => {
        const memberId = getMemberId(member)
        if (!memberId) return false
        if (isParticipantAtLimit(memberId)) return false
        return true
      }),
    [eligibleMembers, maxIndividualItemsPerParticipant, eventEntries]
  )

  const buildSlotState = (participantIds: string[]) => {
    const exactSlots = Math.max(1, Number(maxParticipantsAllowed) || 1)
    const next = [...participantIds].slice(0, exactSlots)
    while (next.length < exactSlots) next.push('')
    return next
  }

  const refreshItemEntries = async (itemId: string): Promise<ICompetitionEntry[]> => {
    if (!itemId) {
      setItemEntries([])
      return []
    }

    setIsLoadingItemEntries(true)
    try {
      const response = await competitionApi.getEntriesByItem(itemId)
      const entries = response.data.data
      setItemEntries(entries)
      return entries
    } catch {
      setItemEntries([])
      return []
    } finally {
      setIsLoadingItemEntries(false)
    }
  }

  useEffect(() => {
    refreshItemEntries(selectedItemId)
  }, [selectedItemId])

  useEffect(() => {
    const exactSlots = Math.max(1, Number(maxParticipantsAllowed) || 1)
    setSlotSelections((prev) => {
      const next = [...prev].slice(0, exactSlots)
      while (next.length < exactSlots) next.push('')
      return next
    })
  }, [maxParticipantsAllowed])

  useEffect(() => {
    setSlotSelections((prev) =>
      prev.map((participantId) => {
        if (!participantId) return ''

        const existsInTeam = eligibleMembers.some((member) => getMemberId(member) === participantId)
        if (!existsInTeam) return ''
        if (isParticipantAtLimit(participantId)) return ''
        return participantId
      })
    )
  }, [eligibleMembers, maxIndividualItemsPerParticipant, eventEntries])

  const myManagerRole = useMemo(() => {
    if (!myTeam || !currentUserId) return null

    const myMembership = myTeam.members.find((member) => {
      const memberUser = member.user
      const memberUserId =
        typeof memberUser === 'string'
          ? memberUser
          : memberUser?._id || memberUser?.id

      return memberUserId === currentUserId
    })

    if (!myMembership) return null
    return myMembership.role
  }, [myTeam, currentUserId])

  const canManageMembers =
    myManagerRole === 'MANAGER' || myManagerRole === 'ASST_MANAGER'

  const getRoleVariant = (role: TeamRole) => {
    if (role === 'MANAGER') return 'success'
    if (role === 'ASST_MANAGER') return 'info'
    if (role === 'CAPTAIN') return 'warning'
    return 'neutral'
  }

  const handleCreateTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!teamName.trim()) {
      setError('Team name is required.')
      return
    }

    if (!managerEmail.trim()) {
      setError('Manager email is required.')
      return
    }

    setError('')
    setIsCreatingTeam(true)

    try {
      const response = await teamApi.createTeam(eventId, teamName.trim(), managerEmail.trim())
      const createdTeam = response.data.data
      setTeams((prev) => [...prev, createdTeam])
      setTeamName('')
      setManagerEmail('')
      await loadData()
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!myTeam) {
      setError('You are not assigned to a team.')
      return
    }

    if (!newMemberEmail.trim()) {
      setError('Member email is required.')
      return
    }

    setError('')
    setIsAddingMember(true)

    try {
      const response = await teamApi.addMember(
        myTeam._id,
        newMemberEmail.trim(),
        memberRole,
        memberCategoryId
      )

      const updatedTeam = response.data.data
      setTeams((prev) => prev.map((team) => (team._id === updatedTeam._id ? updatedTeam : team)))
      if (myTeam._id === updatedTeam._id) {
        setMyTeam(updatedTeam)
      }

      setNewMemberEmail('')
      setMemberRole('MEMBER')
      setMemberCategoryId('')

      await loadData()
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleOpenEnrollModal = async () => {
    if (!selectedItemId) {
      setError('Please select an item.')
      return
    }

    const latestEntries = await refreshItemEntries(selectedItemId)

    const existingIds = !myTeam
      ? []
      : latestEntries
          .filter((entry) => getEntryTeamId(entry) === myTeam._id)
          .flatMap((entry) =>
            (entry.participants || [])
              .map((participant) => getEntryParticipantId(participant))
              .filter(Boolean)
          )

    const uniqueExistingIds = Array.from(new Set(existingIds))
    setSlotSelections(buildSlotState(uniqueExistingIds))

    setError('')
    setIsEnrollModalOpen(true)
  }

  const getSlotOptions = (slotIndex: number) => {
    const selectedByOtherSlots = new Set(
      slotSelections.filter((value, index) => index !== slotIndex && Boolean(value))
    )

    const currentSlotValue = slotSelections[slotIndex] || ''

    return availableEligibleMembers.filter((member) => {
      const memberId = getMemberId(member)
      if (!memberId) return false
      if (memberId === currentSlotValue) return true
      if (selectedByOtherSlots.has(memberId)) return false
      return true
    })
  }

  const handleSlotChange = (slotIndex: number, participantId: string) => {
    setSlotSelections((prev) => {
      const next = [...prev]
      next[slotIndex] = participantId
      return next
    })
  }

  const handleEnrollInItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!myTeam) {
      setError('You are not assigned to a team.')
      return
    }

    if (!selectedItemId) {
      setError('Please select an item.')
      return
    }

    const selectedIds = Array.from(new Set(slotSelections.filter(Boolean)))

    if (selectedIds.length === 0) {
      setError('Please select at least one participant.')
      return
    }

    if (selectedIds.length < minParticipantsRequired) {
      setError(`This item requires at least ${minParticipantsRequired} participants.`)
      return
    }

    if (selectedIds.length > maxParticipantsAllowed) {
      setError(`This item allows a maximum of ${maxParticipantsAllowed} participants.`)
      return
    }

    setError('')
    setIsEnrolling(true)

    try {
      await axiosInstance.put('/entries/sync', {
        event: eventId,
        item: selectedItemId,
        team: myTeam._id,
        participants: selectedIds
      })

      setSlotSelections((prev) => prev.map(() => ''))
      setIsEnrollModalOpen(false)
      await refreshItemEntries(selectedItemId)
      await loadData()
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsEnrolling(false)
    }
  }

  const participantCount = selectedParticipantIds.length
  const participantCountWarning =
    !selectedItemId
      ? ''
      : participantCount < minParticipantsRequired
      ? `This item requires at least ${minParticipantsRequired} participants.`
      : participantCount > maxParticipantsAllowed
      ? `This item allows a maximum of ${maxParticipantsAllowed} participants.`
      : ''
  const isEnrollDisabled =
    isEnrolling ||
    !selectedItemId ||
    isLoadingItemEntries ||
    participantCount < minParticipantsRequired ||
    participantCount > maxParticipantsAllowed

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <div className="text-center text-gray-600 py-8">Loading team dashboard...</div>
      </section>
    )
  }

  if (!isOrganizer && !myTeam) {
    return (
      <section className="bg-white rounded-xl shadow p-6 md:p-8">
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Participating Teams</h3>

          {teams.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <p className="text-gray-700 font-medium">No teams have registered yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900">{team.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Points: {team.totalPoints}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-sm text-gray-600">Create and manage your event team.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!myTeam ? (
        <div className="space-y-6">
          <form onSubmit={handleCreateTeam} className="border border-gray-200 bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Create a Team</h3>
            <Input
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              maxLength={80}
            />
            <Input
              label="Manager Email"
              type="email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              placeholder="Enter manager email"
            />
            <Button type="submit" isLoading={isCreatingTeam}>
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </form>

          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Teams</h3>

            {teams.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <p className="text-gray-700 font-medium">No teams created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div key={team._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="font-semibold text-gray-900">{team.name}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Points: {team.totalPoints}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-primary-200 bg-primary-50/60 rounded-xl p-5">
            <h3 className="text-xl font-bold text-primary-900">{myTeam.name}</h3>
            <p className="text-primary-700 mt-1">Total Points: {myTeam.totalPoints}</p>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Role</th>
                  <th className="py-2 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {myTeam.members.map((member, index) => (
                  <tr key={`${getMemberName(member)}-${index}`} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-3 pr-4 text-gray-900 font-medium">{getMemberName(member)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={getRoleVariant(member.role)} label={member.role} />
                    </td>
                    <td className="py-3 text-gray-700">{getMemberCategory(member)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canManageMembers && (
            <div className="space-y-6">
              <form onSubmit={handleAddMember} className="border border-gray-200 bg-gray-50 rounded-xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>

                <Input
                  label="Email Address"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter teammate's email"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as TeamRole)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ASST_MANAGER">ASST_MANAGER</option>
                    <option value="CAPTAIN">CAPTAIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={memberCategoryId}
                    onChange={(e) => setMemberCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category (optional)</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" isLoading={isAddingMember}>
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </form>

              <form onSubmit={handleEnrollInItem} className="border border-gray-200 bg-gray-50 rounded-xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Enroll in Items</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competition Item</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value)
                      setSlotSelections((prev) => prev.map(() => ''))
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select an item</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <Button type="button" onClick={handleOpenEnrollModal} disabled={!selectedItemId || isLoadingItemEntries}>
                  <Plus className="w-4 h-4" />
                  Enroll Participants
                </Button>

                {participantCountWarning && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-sm text-amber-800">{participantCountWarning}</p>
                  </div>
                )}
              </form>

              <Modal
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                title="Enroll Participants"
                size="lg"
              >
                <form onSubmit={handleEnrollInItem} className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-sm font-medium text-gray-800 mb-1">Already Enrolled</p>
                    {enrolledMembersForTeamItem.length === 0 ? (
                      <p className="text-sm text-gray-600">No participants enrolled yet for this team and item.</p>
                    ) : (
                      <p className="text-sm text-gray-700">
                        {enrolledMembersForTeamItem.map((member) => getMemberName(member)).join(', ')}
                      </p>
                    )}
                  </div>

                  {availableEligibleMembers.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-sm text-amber-800">
                        No eligible participants available to add. Already-enrolled participants are blocked.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 max-h-80 overflow-auto pr-1">
                    {Array.from({ length: Math.max(1, Number(maxParticipantsAllowed) || 1) }).map((_, slotIndex) => {
                      const slotOptions = getSlotOptions(slotIndex)
                      return (
                        <div key={`slot-${slotIndex}`}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Participant {slotIndex + 1}
                          </label>
                          <select
                            value={slotSelections[slotIndex] || ''}
                            onChange={(e) => handleSlotChange(slotIndex, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Select participant (optional)</option>
                            {slotOptions.length === 0 && (
                              <option value="" disabled>
                                No available participants
                              </option>
                            )}
                            {slotOptions.map((member, index) => {
                              const memberId = getMemberId(member)
                              return (
                                <option key={`${memberId}-${index}`} value={memberId}>
                                  {getMemberName(member)}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )
                    })}
                  </div>

                  {participantCountWarning && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-sm text-amber-800">{participantCountWarning}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsEnrollModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isEnrolling} disabled={isEnrollDisabled}>
                      Save Enrollment
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default TeamDashboard
