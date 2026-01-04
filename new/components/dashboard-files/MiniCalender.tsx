'use client'

import { format, isBefore, startOfDay } from 'date-fns'
import { Calendar, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Script {
  id: number
  title?: string
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published'
  scheduled_date?: string | Date | null
}

interface MiniCalendarProps {
  scheduledScripts: Script[]
}

export default function MiniCalendar({ scheduledScripts }: MiniCalendarProps) {
  const router = useRouter()
  const today = startOfDay(new Date())

  // Normalize scheduled_date to Date objects
  const normalizedScripts = scheduledScripts
    .map(script => ({
      ...script,
      scheduled_date: script.scheduled_date
        ? script.scheduled_date instanceof Date
          ? script.scheduled_date
          : new Date(script.scheduled_date)
        : null,
    }))
    .filter(script => script.scheduled_date) // Only keep scripts with a scheduled date

  const upcoming = normalizedScripts
    .filter(script => !isBefore(script.scheduled_date!, today))
    .sort((a, b) => a.scheduled_date!.getTime() - b.scheduled_date!.getTime())
    .slice(0, 3)

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-500" />
          <h3 className="font-semibold text-stone-900">Upcoming</h3>
        </div>
        <button
          onClick={() => router.push('/dashboard/calendar')}
          className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Script List */}
      {upcoming.length === 0 ? (
        <p className="text-sm text-stone-500 py-4 text-center">
          No scheduled publishes
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map(script => (
            <button
              key={script.id}
              onClick={() =>
                router.push(`/dashboard/calendar`)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <div className="text-center min-w-[48px]">
                <div className="text-xs text-stone-500 uppercase">
                  {format(script.scheduled_date!, 'MMM')}
                </div>
                <div className="text-xl font-bold text-stone-900">
                  {format(script.scheduled_date!, 'd')}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-900 truncate">
                  {script.title}
                </div>
                <div className="text-xs text-stone-500 capitalize">
                  {script.stage}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
