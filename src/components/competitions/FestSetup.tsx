import { FormEvent, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import {
  competitionApi,
  ICategory,
  ICompetitionItem
} from '../../api/competition.api'
import { getErrorMessage } from '../../utils/formatters'

interface FestSetupProps {
  eventId: string
  title?: string
  subtitle?: string
}

type ActiveTab = 'CATEGORIES' | 'ITEMS'

const FestSetup = ({
  eventId,
  title = 'Fest Setup',
  subtitle = 'Create categories and configure competition items.'
}: FestSetupProps) => {
  const { refreshEvent } = useOutletContext<any>()
  const [categories, setCategories] = useState<ICategory[]>([])
  const [items, setItems] = useState<ICompetitionItem[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('CATEGORIES')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  const [itemName, setItemName] = useState('')
  const [itemType, setItemType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [maxParticipantsPerTeam, setMaxParticipantsPerTeam] = useState(1)
  const [placePoints, setPlacePoints] = useState({ first: 10, second: 6, third: 2 })
  const [gradePoints, setGradePoints] = useState({ a: 5, b: 3, c: 1 })
  const [isItemSubmitting, setIsItemSubmitting] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        competitionApi.getCategories(eventId),
        competitionApi.getItems(eventId)
      ])

      setCategories(categoriesRes.data.data)
      setItems(itemsRes.data.data)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventId])

  const resetCategoryForm = () => {
    setCategoryName('')
    setCategoryDescription('')
  }

  const resetItemForm = () => {
    setItemName('')
    setItemType('INDIVIDUAL')
    setSelectedCategoryIds([])
    setMaxParticipantsPerTeam(1)
    setPlacePoints({ first: 10, second: 6, third: 2 })
    setGradePoints({ a: 5, b: 3, c: 1 })
  }

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!categoryName.trim()) {
      setError('Category name is required.')
      return
    }

    setError('')
    setIsCategorySubmitting(true)

    try {
      const response = await competitionApi.createCategory(eventId, {
        name: categoryName.trim(),
        description: categoryDescription.trim()
      })

      const createdCategory = response.data.data
      setCategories((prev) => [...prev, createdCategory])

      resetCategoryForm()
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    setError('')
    setDeletingCategoryId(categoryId)

    try {
      await competitionApi.deleteCategory(categoryId)
      setCategories((prev) => prev.filter((category) => category._id !== categoryId))
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryId))
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const toggleSelectedCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleItemSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!itemName.trim()) {
      setError('Item name is required.')
      return
    }

    if (maxParticipantsPerTeam < 1) {
      setError('Max participants per team must be at least 1.')
      return
    }

    setError('')
    setIsItemSubmitting(true)

    try {
      const response = await competitionApi.createItem(eventId, {
        name: itemName.trim(),
        type: itemType,
        allowedCategories: selectedCategoryIds,
        maxParticipantsPerTeam,
        placePoints,
        gradePoints
      })

      const createdItem = response.data.data
      setItems((prev) => [...prev, createdItem])

      resetItemForm()
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsItemSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    setError('')
    setDeletingItemId(itemId)

    try {
      await competitionApi.deleteItem(itemId)
      setItems((prev) => prev.filter((item) => item._id !== itemId))
      await refreshEvent()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingItemId(null)
    }
  }

  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>

        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
              activeTab === 'CATEGORIES'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ITEMS')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
              activeTab === 'ITEMS'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Items
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          Loading setup data...
        </div>
      ) : activeTab === 'CATEGORIES' ? (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleCategorySubmit} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Category</h3>

            <Input
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Music, Dance, Debate"
              maxLength={80}
            />

            <Input
              label="Description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Optional short description"
              maxLength={180}
            />

            <Button type="submit" isLoading={isCategorySubmitting}>
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </form>

          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Categories</h3>

            {categories.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <p className="text-gray-700 font-medium">No categories added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-200">
                      <th className="py-2 pr-4 font-semibold">Name</th>
                      <th className="py-2 pr-4 font-semibold">Description</th>
                      <th className="py-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">{category.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{category.description || '—'}</td>
                        <td className="py-3 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category._id)}
                            isLoading={deletingCategoryId === category._id}
                            disabled={deletingCategoryId !== null && deletingCategoryId !== category._id}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleItemSubmit} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Competition Item</h3>

            <Input
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Solo Singing"
              maxLength={100}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as 'INDIVIDUAL' | 'GROUP')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="GROUP">GROUP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Categories</label>
              <div className="max-h-40 overflow-auto border border-gray-300 rounded-lg bg-white p-3 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Create categories first.</p>
                ) : (
                  categories.map((category) => (
                    <label key={category._id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category._id)}
                        onChange={() => toggleSelectedCategory(category._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants Per Team</label>
              <input
                type="number"
                value={maxParticipantsPerTeam}
                onChange={(e) => setMaxParticipantsPerTeam(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Scoring Rules (Points)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Place Points (1st, 2nd, 3rd)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={placePoints.first}
                      onChange={(e) => setPlacePoints((p) => ({ ...p, first: +e.target.value }))}
                      className="w-full p-2 border rounded text-center"
                      title="1st Place"
                    />
                    <input
                      type="number"
                      value={placePoints.second}
                      onChange={(e) => setPlacePoints((p) => ({ ...p, second: +e.target.value }))}
                      className="w-full p-2 border rounded text-center"
                      title="2nd Place"
                    />
                    <input
                      type="number"
                      value={placePoints.third}
                      onChange={(e) => setPlacePoints((p) => ({ ...p, third: +e.target.value }))}
                      className="w-full p-2 border rounded text-center"
                      title="3rd Place"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Grade Points (A, B, C)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={gradePoints.a}
                      onChange={(e) => setGradePoints((p) => ({ ...p, a: +e.target.value }))}
                      className="w-full p-2 border rounded text-center"
                      title="A Grade"
                    />
                    <input
                      type="number"
                      value={gradePoints.b}
                      onChange={(e) => setGradePoints((p) => ({ ...p, b: +e.target.value }))}
                      className="w-full p-2 border rounded text-center"
                      title="B Grade"
                    />
                    <input
                      type="number"
                      value={gradePoints.c}
                      onChange={(e) => setGradePoints((p) => ({ ...p, c: +e.target.value }))}
                      className="w-full p-2 border rounded text-center"
                      title="C Grade"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={isItemSubmitting}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </form>

          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Items</h3>

            {items.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <p className="text-gray-700 font-medium">No items added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">Type: {item.type}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Max Participants Per Team: {item.maxParticipantsPerTeam}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Allowed Categories:{' '}
                          {item.allowedCategories?.length
                            ? item.allowedCategories.map((cat) => cat.name).join(', ')
                            : 'All'}
                        </p>
                        <div className="flex gap-2 mt-2 text-xs font-medium text-gray-600">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                            🏆 {item.placePoints?.first || 0}/{item.placePoints?.second || 0}/{item.placePoints?.third || 0}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">
                            ⭐ {item.gradePoints?.a || 0}/{item.gradePoints?.b || 0}/{item.gradePoints?.c || 0}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item._id)}
                        isLoading={deletingItemId === item._id}
                        disabled={deletingItemId !== null && deletingItemId !== item._id}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default FestSetup
