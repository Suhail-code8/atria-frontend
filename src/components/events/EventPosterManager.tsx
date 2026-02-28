import { useEffect, useRef, useState } from 'react'
import { Sparkles, Share2, ImageIcon, Download } from 'lucide-react'
import Button from '../Button'
import { eventsApi } from '../../api/events.api'
import { getErrorMessage } from '../../utils/formatters'

interface EventPosterManagerProps {
  eventId: string
  eventTitle: string
  initialPosterUrl?: string
  eventDate?: string
  eventLocation?: string
  eventDescription?: string
}

export const EventPosterManager = ({
  eventId,
  eventTitle,
  initialPosterUrl,
  eventDate,
  eventLocation,
  eventDescription
}: EventPosterManagerProps) => {
  const formatPosterDate = (dateString?: string) => {
    if (!dateString) return 'DATE TBA'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      .toUpperCase()
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [posterUrl, setPosterUrl] = useState(initialPosterUrl || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !posterUrl) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      const ctx = context
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      const W = canvas.width;
      const H = canvas.height;
      const MARGIN = 80;
      const MAX_WIDTH = W - (MARGIN * 2);

      // 1. Editorial Wash & Heavy Vignette
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, H * 0.35, 0, H);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * 0.35, W, H * 0.65);

      // 2. Text Wrapping Helper (Calculates lines dynamically)
      const getLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0] || '';
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = context.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      // 3. Dynamic Bottom-Up Layout Engine
      ctx.textBaseline = 'bottom';
      let currentY = H - MARGIN;

      // --- FOOTER CTA (Left-aligned, integrated action line) ---
      ctx.font = '700 24px "Inter", system-ui, sans-serif';
      ctx.fillStyle = '#818cf8';
      ctx.textAlign = 'left';
      ctx.fillText('REGISTER NOW ON ATRIA ↗', MARGIN, currentY);

      currentY -= 50;

      // --- DATE ---
      ctx.font = '600 36px "Inter", system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(formatPosterDate(eventDate), MARGIN, currentY);

      currentY -= 60;

      // --- TITLE (Wrapped dynamically) ---
      ctx.font = '900 85px "Inter", system-ui, sans-serif';
      const titleLines = getLines(ctx, eventTitle.toUpperCase(), MAX_WIDTH);
      ctx.fillStyle = '#ffffff';
      for (let i = titleLines.length - 1; i >= 0; i--) {
        ctx.fillText(titleLines[i], MARGIN, currentY);
        currentY -= 90;
      }

      currentY -= 20;

      // --- ACCENT BAR ---
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(MARGIN, currentY - 6, 100, 6);
      currentY -= 40;

      // --- DESCRIPTION TAGLINE ---
      if (eventDescription) {
        ctx.font = '600 24px "Inter", system-ui, sans-serif';
        ctx.fillStyle = '#a5b4fc';
        const cleanDesc = eventDescription.replace(/\n/g, ' ').substring(0, 150).toUpperCase();
        const descLines = getLines(ctx, cleanDesc, MAX_WIDTH);
        for (let i = descLines.length - 1; i >= 0; i--) {
          ctx.fillText(descLines[i], MARGIN, currentY);
          currentY -= 34;
        }
      }

    }

    image.onerror = () => {
      setError('Unable to load poster image for canvas rendering.')
    }

    image.src = posterUrl
  }, [posterUrl, eventTitle, eventDate, eventLocation, eventDescription])

  const downloadCompositePoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pngDataUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngDataUrl
    downloadLink.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_poster.png`
    downloadLink.click()
  }

  const handleGeneratePoster = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await eventsApi.generateEventPoster(eventId)
      const nextPosterUrl = response.data.data.posterUrl
      setPosterUrl(nextPosterUrl)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSharePoster = async () => {
    const publicUrl = `${window.location.origin}/events/${eventId}`;
    // Hardcode the URL into the text body so apps like WhatsApp cannot strip it
    const combinedText = `Join us for ${eventTitle}!\n\nRegister here: ${publicUrl}`;

    // Force copy the link to clipboard to bypass OS-level text stripping
    try {
      await navigator.clipboard.writeText(combinedText);
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }

    const shareData: ShareData = {
      title: eventTitle,
      text: combinedText,
    };

    try {
      if (canvasRef.current) {
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'event-poster.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          }
          await navigator.share(shareData);
        }, 'image/png');
      } else {
        await navigator.share(shareData);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(combinedText);
      alert('Event link copied to clipboard!');
    }
  };

  const handleShareLink = async () => {
    const publicUrl = `${window.location.origin}/events/${eventId}`;
    const combinedText = `Join us for ${eventTitle}!\n\nRegister here: ${publicUrl}`;
    try {
      await navigator.share({ title: eventTitle, text: combinedText });
    } catch (error) {
      console.error('Error sharing link:', error);
      await navigator.clipboard.writeText(combinedText);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow p-6 md:p-8 border border-gray-100">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Event Poster Studio</h3>
          <p className="text-sm text-gray-600 mt-1">Create a polished AI poster and instantly share your event.</p>
        </div>
        <div className="hidden md:flex h-10 w-10 rounded-full bg-primary-100 text-primary-700 items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden">
        {posterUrl ? (
          <div className="p-3">
            <canvas
              ref={canvasRef}
              width={1024}
              height={1024}
              className="w-full h-auto rounded-lg bg-gray-200"
            />
          </div>
        ) : (
          <div className="py-14 px-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-600">No poster generated yet.</p>
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <Button
          type="button"
          onClick={handleGeneratePoster}
          disabled={isGenerating}
          className="w-full py-2 px-4 rounded-lg font-medium transition"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'AI is designing your poster...' : 'Generate AI Poster'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleSharePoster}
          disabled={!canvasRef.current || isGenerating}
          className="w-full py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Share Poster
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleShareLink}
          className="w-full py-2 px-4 rounded-lg font-medium transition"
        >
          <Share2 className="w-4 h-4" />
          Share Link Only
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={downloadCompositePoster}
          disabled={!canvasRef.current || isGenerating}
          className="w-full py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download Poster
        </Button>
      </div>

      {isGenerating && (
        <div className="mt-4 flex items-center gap-3 text-sm text-primary-700">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          <span>AI is designing your poster...</span>
        </div>
      )}
    </section>
  )
}

export default EventPosterManager
