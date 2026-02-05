export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDateTime = (dateString: string | Date | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const truncateText = (text: string, length: number = 100): string => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}
