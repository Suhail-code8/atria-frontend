import { FormEvent, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AlertCircle, PlusCircle } from 'lucide-react'
import Button from '../Button'
import { ICompetitionEntry, competitionApi, ICompetitionItem } from '../../api/competition.api'
import { resultApi } from '../../api/result.api'
import { useAuth } from '../../auth/AuthContext'
import { UserRole } from '../../types'
import { getErrorMessage } from '../../utils/formatters'

interface ScoringDashboardProps {
  eventId: string
}

interface EntryTeam {
  _id: string
  name: string
}

interface EntryParticipant {
  _id: string
  name?: string
  email?: string
}

interface CompetitionEntry {
  _id: string
  team: EntryTeam | string
  participants: EntryParticipant[]
  status?: string
}

const normalizeEntry = (entry: ICompetitionEntry): CompetitionEntry | null => {
  if (!entry?._id || !entry.team) {
    return null
  }

  const participants = (entry.participants || [])
    .map((participant) => {
      if (typeof participant === 'string') {
        return { _id: participant }
      }

      const id = participant._id || participant.id || ''
      if (!id) return null

      return {
        _id: id,
        name: participant.name,
        email: participant.email
      }
    })
    .filter(Boolean) as EntryParticipant[]

  const team =
    typeof entry.team === 'string'
      ? entry.team
      : {
          _id: entry.team._id || '',
          name: entry.team.name || 'Unnamed Team'
        }

  if (!team || (typeof team !== 'string' && !team._id)) {
    return null
  }

  return {
    _id: entry._id,
    team,
    participants,
    status: entry.status
  }
}

const getTeamId = (team: EntryTeam | string) =>
  typeof team === 'string' ? team : team._id

const getTeamName = (team: EntryTeam | string) =>
  typeof team === 'string' ? team : team.name

const buildPlaceOptions = (item?: ICompetitionItem | null) => {
  const placePoints = item?.placePoints
  return [
    { value: '1', points: Number(placePoints?.first ?? 10) },
    { value: '2', points: Number(placePoints?.second ?? 6) },
    { value: '3', points: Number(placePoints?.third ?? 2) }
  ]
}

const buildGradeOptions = (item?: ICompetitionItem | null) => {
  const gradePoints = item?.gradePoints
  return [
    { value: 'A', points: Number(gradePoints?.a ?? 5) },
    { value: 'B', points: Number(gradePoints?.b ?? 3) },
    { value: 'C', points: Number(gradePoints?.c ?? 1) }
  ]
}

const ScoringDashboard = ({ eventId }: ScoringDashboardProps) => {
  const { refreshEvent } = useOutletContext<any>()
  const { user } = useAuth()
  const [items, setItems] = useState<ICompetitionItem[]>([])
  const [entries, setEntries] = useState<CompetitionEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<CompetitionEntry | null>(null)
  const [placeOptions, setPlaceOptions] = useState<Array<{ value: string; points: number }>>([])
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; points: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [itemId, setItemId] = useState('')
  const [entryId, setEntryId] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [place, setPlace] = useState('1')
  const [grade, setGrade] = useState('A')

  const isOrganizer = user?.role === UserRole.ORGANIZER

  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry._id, entry])).values()
  )
  const visibleEntries = uniqueEntries

  const selectedItem = items.find((item) => item._id === itemId)
  const selectedItemType = (selectedItem?.type || '') as string
  const isSingleItem = selectedItemType === 'INDIVIDUAL' || selectedItemType === 'SINGLE'

  const loadEntriesForItem = async (targetItemId: string) => {
    if (!targetItemId) {
      setEntries([])
      setSelectedEntry(null)
      setEntryId('')
      setParticipantId('')
      return
    }

    try {
      setParticipantId('')

      const response = await competitionApi.getEntriesByItem(targetItemId)
      const fetchedEntries = response.data.data

      const dedupedEntries = Array.from(
        new Map(
          fetchedEntries
            .map((entry) => normalizeEntry(entry))
            .filter(Boolean)
            .map((entry) => [entry!._id, entry!])
        ).values()
      )
      setEntries(dedupedEntries)

      const validEntryIds = new Set(dedupedEntries.map((entry) => entry._id))

      setEntryId((currentEntryId) => {
        if (currentEntryId && validEntryIds.has(currentEntryId)) {
          return currentEntryId
        }
        return dedupedEntries[0]?._id || ''
      })
    } catch (err: unknown) {
      setEntries([])
      setEntryId('')
      setParticipantId('')
      setError(getErrorMessage(err))
    }
  }

  const getEntryLabel = (entry: CompetitionEntry) => {
    const teamName = getTeamName(entry.team)

    if (isSingleItem) {
      const participant = entry.participants[0]
      const participantName =
        participant?.name || participant?.email || 'Unnamed participant'
      return `${participantName} (${teamName})`
    }

    return `${teamName} (Group)`
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const itemsRes = await competitionApi.getItems(eventId)

        const fetchedItems = itemsRes.data.data

        setItems(fetchedItems)
        const initialItem = fetchedItems[0] || null
        const nextPlaceOptions = buildPlaceOptions(initialItem)
        const nextGradeOptions = buildGradeOptions(initialItem)

        setPlaceOptions(nextPlaceOptions)
        setGradeOptions(nextGradeOptions)

        if (fetchedItems.length > 0 && !itemId) {
          setItemId(fetchedItems[0]._id)
        }

        setPlace(nextPlaceOptions[0]?.value || '')
        setGrade(nextGradeOptions[0]?.value || '')
      } catch (err: unknown) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [eventId])

  useEffect(() => {
    const nextPlaceOptions = buildPlaceOptions(selectedItem)
    const nextGradeOptions = buildGradeOptions(selectedItem)

    setPlaceOptions(nextPlaceOptions)
    setGradeOptions(nextGradeOptions)
    setPlace(nextPlaceOptions[0]?.value || '')
    setGrade(nextGradeOptions[0]?.value || '')
  }, [selectedItem])

  useEffect(() => {
    loadEntriesForItem(itemId)
  }, [itemId])

  useEffect(() => {
    const entry = uniqueEntries.find((itemEntry) => itemEntry._id === entryId) || null
    setSelectedEntry(entry)

    if (!entry) {
      setParticipantId('')
      return
    }

    if (isSingleItem) {
      setParticipantId(entry.participants[0]?._id || '')
      return
    }

    setParticipantId('')
  }, [entryId, uniqueEntries, isSingleItem])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!itemId || !entryId) {
      setError('Please select both item and entry.')
      return
    }

    if (!selectedEntry) {
      setError('Selected team entry not found for this item.')
      return
    }

    const resolvedParticipantId = isSingleItem
      ? participantId
      : selectedEntry.participants[0]?._id || ''

    if (!resolvedParticipantId) {
      setError('Please select a participant.')
      return
    }

    const selectedTeamId = getTeamId(selectedEntry.team)

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      await resultApi.submitResult({
        eventId,
        itemId,
        entryId,
        teamId: selectedTeamId,
        participantId: resolvedParticipantId,
        place: place ? Number(place) : undefined,
        grade: grade || undefined
      })

      await loadEntriesForItem(itemId)
      await refreshEvent()
      setSuccessMessage('Result submitted successfully.')
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOrganizer) {
    return null
  }

  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-bold text-gray-900">Scoring Dashboard</h2>
      </div>

      {isLoading && <p className="text-sm text-gray-600">Loading scoring data...</p>}

      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      {!isLoading && (
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Competition Item</label>
            <select
              value={itemId}
              onChange={(e) => {
                setItemId(e.target.value)
                setEntryId('')
                setSelectedEntry(null)
                setParticipantId('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Entry/Participant</label>
            <select
              value={entryId}
              onChange={(e) => setEntryId(e.target.value)}
              disabled={visibleEntries.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {visibleEntries.length === 0 && <option value="">No entries found for this item</option>}
              {visibleEntries.map((entry) => (
                <option key={entry._id} value={entry._id}>
                  {getEntryLabel(entry)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Place</label>
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              disabled={placeOptions.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {placeOptions.length === 0 && <option value="">No place rules configured</option>}
              {placeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Place {option.value} ({option.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={gradeOptions.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {gradeOptions.length === 0 && <option value="">No grade rules configured</option>}
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Grade {option.value} ({option.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" isLoading={isSubmitting}>
              Submit Result
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ScoringDashboard
